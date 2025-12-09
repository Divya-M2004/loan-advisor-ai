// @ts-expect-error: Remote Deno std import used in Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error: Remote ESM import for Supabase client used at runtime in Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
env: {
get(name: string): string | undefined;
};
};
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoanAssessmentData {
  monthlyIncome: number;
  employmentType: string;
  employmentDurationMonths: number;
  existingLoans: Array<{
    type: string;
    amount: number;
    monthlyEmi: number;
  }>;
  creditScore?: number;
  loanAmountRequested: number;
  loanPurpose: string;
}

serve(async (req:Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const assessmentData: LoanAssessmentData = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Calculate eligibility using AI-powered assessment
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare assessment prompt for AI
    const assessmentPrompt = `
    As a loan eligibility expert, analyze this loan application and provide a detailed assessment:

    Applicant Details:
    - Monthly Income: ₹${assessmentData.monthlyIncome}
    - Employment Type: ${assessmentData.employmentType}
    - Employment Duration: ${assessmentData.employmentDurationMonths} months
    - Credit Score: ${assessmentData.creditScore || 'Not provided'}
    - Requested Loan Amount: ₹${assessmentData.loanAmountRequested}
    - Loan Purpose: ${assessmentData.loanPurpose}
    - Existing Loans: ${JSON.stringify(assessmentData.existingLoans)}

    Please provide:
    1. Eligibility score (0-100)
    2. Recommended loan amount
    3. Risk assessment
    4. Improvement suggestions
    5. Suitable loan products

    Respond in JSON format with these fields: eligibilityScore, recommendedAmount, riskLevel, suggestions, suitableProducts, reasoning
    `;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert loan underwriter. Always respond with valid JSON only.' },
          { role: 'user', content: assessmentPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI assessment failed');
    }

    const aiData = await aiResponse.json();
    let assessmentResult;
    
    try {
      assessmentResult = JSON.parse(aiData.choices[0]?.message?.content || '{}');
    } catch {
      // Fallback to rule-based assessment if AI response is not valid JSON
      assessmentResult = calculateBasicEligibility(assessmentData);
    }

    // Calculate total existing EMI
    const totalExistingEmi = assessmentData.existingLoans.reduce((sum, loan) => sum + loan.monthlyEmi, 0);
    const debtToIncomeRatio = (totalExistingEmi / assessmentData.monthlyIncome) * 100;

    // Save assessment to database
    const { data: savedAssessment, error: saveError } = await supabase
      .from('loan_assessments')
      .insert({
        user_id: user.id,
        monthly_income: assessmentData.monthlyIncome,
        employment_type: assessmentData.employmentType,
        employment_duration_months: assessmentData.employmentDurationMonths,
        existing_loans: assessmentData.existingLoans,
        credit_score: assessmentData.creditScore,
        loan_amount_requested: assessmentData.loanAmountRequested,
        loan_purpose: assessmentData.loanPurpose,
        eligibility_score: assessmentResult.eligibilityScore || 0,
        recommended_amount: assessmentResult.recommendedAmount || 0,
        assessment_result: {
          ...assessmentResult,
          debtToIncomeRatio,
          calculatedAt: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
    }

    return new Response(JSON.stringify({
      assessmentId: savedAssessment?.id,
      eligibilityScore: assessmentResult.eligibilityScore || 0,
      recommendedAmount: assessmentResult.recommendedAmount || 0,
      riskLevel: assessmentResult.riskLevel || 'medium',
      debtToIncomeRatio,
      suggestions: assessmentResult.suggestions || [],
      suitableProducts: assessmentResult.suitableProducts || [],
      reasoning: assessmentResult.reasoning || 'Basic eligibility assessment completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in loan-eligibility-check function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Assessment failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateBasicEligibility(data: LoanAssessmentData) {
  const totalExistingEmi = data.existingLoans.reduce((sum, loan) => sum + loan.monthlyEmi, 0);
  const availableIncome = data.monthlyIncome - totalExistingEmi;
  const maxEmi = availableIncome * 0.6; // 60% of available income
  const recommendedAmount = maxEmi * 12 * 5; // Assuming 5-year tenure
  
  let eligibilityScore = 50; // Base score
  
  // Adjust based on employment type
  if (data.employmentType === 'salaried') eligibilityScore += 20;
  else if (data.employmentType === 'self_employed') eligibilityScore += 10;
  
  // Adjust based on employment duration
  if (data.employmentDurationMonths >= 24) eligibilityScore += 15;
  else if (data.employmentDurationMonths >= 12) eligibilityScore += 10;
  
  // Adjust based on credit score
  if (data.creditScore) {
    if (data.creditScore >= 750) eligibilityScore += 15;
    else if (data.creditScore >= 650) eligibilityScore += 10;
    else if (data.creditScore < 600) eligibilityScore -= 20;
  }
  
  eligibilityScore = Math.max(0, Math.min(100, eligibilityScore));
  
  return {
    eligibilityScore,
    recommendedAmount: Math.min(recommendedAmount, data.loanAmountRequested),
    riskLevel: eligibilityScore >= 70 ? 'low' : eligibilityScore >= 50 ? 'medium' : 'high',
    suggestions: ['Maintain regular income', 'Improve credit score', 'Reduce existing debt'],
    suitableProducts: ['Personal Loan', 'Business Loan'],
    reasoning: 'Basic rule-based assessment completed'
  };
}