# backend/finance/services/langchain_service.py
import os
from typing import Dict, List, Any, Optional
import json

# LangChain imports with fallback
try:
    from langchain.llms import OpenAI
    from langchain.chains import LLMChain
    from langchain.prompts import PromptTemplate
    from langchain.schema import BaseOutputParser
    from langchain.memory import ConversationBufferMemory
    from langchain.agents import initialize_agent, Tool, AgentType
    from langchain.tools import BaseTool
    LANGCHAIN_AVAILABLE = True
except ImportError:
    # Fallback for when LangChain is not installed
    LANGCHAIN_AVAILABLE = False
    print("Warning: LangChain not available. AI features will be limited.")


class FinancialInsightParser(BaseOutputParser):
    """Custom parser for financial insights"""
    
    def parse(self, text: str) -> Dict[str, Any]:
        try:
            # Try to parse as JSON first
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback to structured text parsing
            return {
                'insights': [text],
                'recommendations': [],
                'risk_factors': [],
                'confidence': 0.5
            }


class FinancialAnalysisTool(BaseTool):
    """Custom tool for financial analysis"""
    
    name = "financial_analysis"
    description = "Analyze financial data and provide insights"
    
    def _run(self, financial_data: str) -> str:
        """Run financial analysis"""
        # This would integrate with your AI services
        return f"Analysis of financial data: {financial_data}"
    
    async def _arun(self, financial_data: str) -> str:
        """Async run financial analysis"""
        return self._run(financial_data)


class LangChainFinancialAdvisor:
    """LangChain-powered financial advisor for SMEs"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.llm = OpenAI(
            temperature=0.3,
            max_tokens=1000,
            openai_api_key=self.openai_api_key
        )
        
        # Initialize tools
        self.tools = [
            FinancialAnalysisTool(),
            Tool(
                name="budget_analysis",
                description="Analyze budget performance and provide recommendations",
                func=self._analyze_budget
            ),
            Tool(
                name="cash_flow_analysis",
                description="Analyze cash flow patterns and predict future trends",
                func=self._analyze_cash_flow
            ),
            Tool(
                name="credit_scoring",
                description="Calculate credit score and provide improvement recommendations",
                func=self._calculate_credit_score
            ),
            Tool(
                name="supplier_negotiation",
                description="Provide supplier negotiation strategies and insights",
                func=self._analyze_supplier_negotiation
            )
        ]
        
        # Initialize agent
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            memory=ConversationBufferMemory()
        )
        
        # Initialize chains
        self._setup_chains()
    
    def _setup_chains(self):
        """Setup LangChain chains for different financial tasks"""
        
        # Financial Health Analysis Chain
        health_template = """
        You are a financial advisor for small and medium enterprises (SMEs).
        Analyze the following financial data and provide insights:
        
        Financial Data:
        {financial_data}
        
        Please provide:
        1. Overall financial health assessment (score 0-100)
        2. Key insights and observations
        3. Specific recommendations for improvement
        4. Risk factors to watch
        5. Growth opportunities
        
        Format your response as JSON with the following structure:
        {{
            "health_score": <number>,
            "insights": [<list of insights>],
            "recommendations": [<list of recommendations>],
            "risk_factors": [<list of risk factors>],
            "growth_opportunities": [<list of opportunities>]
        }}
        """
        
        self.health_chain = LLMChain(
            llm=self.llm,
            prompt=PromptTemplate(
                template=health_template,
                input_variables=["financial_data"]
            ),
            output_parser=FinancialInsightParser()
        )
        
        # Revenue Forecasting Chain
        forecast_template = """
        You are a financial forecasting expert for SMEs.
        Based on the following historical revenue data, provide a 6-month revenue forecast:
        
        Historical Data:
        {historical_data}
        
        Please provide:
        1. Monthly revenue forecast for the next 6 months
        2. Confidence level (0-100%)
        3. Key assumptions and factors
        4. Risk factors that could affect the forecast
        5. Recommendations for improving revenue
        
        Format your response as JSON:
        {{
            "monthly_forecast": [<list of 6 monthly values>],
            "confidence": <number>,
            "assumptions": [<list of assumptions>],
            "risk_factors": [<list of risk factors>],
            "recommendations": [<list of recommendations>]
        }}
        """
        
        self.forecast_chain = LLMChain(
            llm=self.llm,
            prompt=PromptTemplate(
                template=forecast_template,
                input_variables=["historical_data"]
            ),
            output_parser=FinancialInsightParser()
        )
        
        # Credit Scoring Chain
        credit_template = """
        You are a credit risk analyst for SMEs.
        Analyze the following business data and calculate a credit score:
        
        Business Data:
        {business_data}
        
        Please provide:
        1. Credit score (300-850)
        2. Score category (Poor/Fair/Good/Very Good/Excellent)
        3. Key factors affecting the score
        4. Specific recommendations for improvement
        5. Loan eligibility assessment
        
        Format your response as JSON:
        {{
            "credit_score": <number>,
            "score_category": "<category>",
            "factors": {{
                "payment_history": "<score and explanation>",
                "credit_utilization": "<score and explanation>",
                "business_age": "<score and explanation>",
                "revenue_stability": "<score and explanation>",
                "debt_to_income": "<score and explanation>"
            }},
            "recommendations": [<list of recommendations>],
            "loan_eligibility": "<assessment>"
        }}
        """
        
        self.credit_chain = LLMChain(
            llm=self.llm,
            prompt=PromptTemplate(
                template=credit_template,
                input_variables=["business_data"]
            ),
            output_parser=FinancialInsightParser()
        )
        
        # Supplier Negotiation Chain
        negotiation_template = """
        You are a procurement and negotiation expert for SMEs.
        Analyze the following supplier spending data and provide negotiation strategies:
        
        Supplier Data:
        {supplier_data}
        
        Please provide:
        1. Negotiation priorities (which suppliers to focus on)
        2. Specific negotiation strategies for each priority supplier
        3. Potential cost savings opportunities
        4. Risk mitigation strategies
        5. Contract negotiation tips
        
        Format your response as JSON:
        {{
            "priorities": [<list of priority suppliers>],
            "strategies": {{
                "<supplier_name>": "<negotiation strategy>"
            }},
            "cost_savings": [<list of savings opportunities>],
            "risk_mitigation": [<list of risk mitigation strategies>],
            "contract_tips": [<list of contract negotiation tips>]
        }}
        """
        
        self.negotiation_chain = LLMChain(
            llm=self.llm,
            prompt=PromptTemplate(
                template=negotiation_template,
                input_variables=["supplier_data"]
            ),
            output_parser=FinancialInsightParser()
        )
    
    def analyze_financial_health(self, financial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze overall financial health using LangChain"""
        try:
            result = self.health_chain.run(financial_data=json.dumps(financial_data))
            return result
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "health_score": 50,
                "insights": ["Unable to analyze financial data"],
                "recommendations": ["Please check your data and try again"],
                "risk_factors": [],
                "growth_opportunities": []
            }
    
    def generate_revenue_forecast(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate revenue forecast using LangChain"""
        try:
            result = self.forecast_chain.run(historical_data=json.dumps(historical_data))
            return result
        except Exception as e:
            return {
                "error": f"Forecast generation failed: {str(e)}",
                "monthly_forecast": [0] * 6,
                "confidence": 50,
                "assumptions": ["Unable to generate forecast"],
                "risk_factors": [],
                "recommendations": []
            }
    
    def calculate_credit_score(self, business_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate credit score using LangChain"""
        try:
            result = self.credit_chain.run(business_data=json.dumps(business_data))
            return result
        except Exception as e:
            return {
                "error": f"Credit scoring failed: {str(e)}",
                "credit_score": 600,
                "score_category": "Fair",
                "factors": {},
                "recommendations": ["Unable to calculate credit score"],
                "loan_eligibility": "Unknown"
            }
    
    def analyze_supplier_negotiation(self, supplier_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze supplier negotiation opportunities using LangChain"""
        try:
            result = self.negotiation_chain.run(supplier_data=json.dumps(supplier_data))
            return result
        except Exception as e:
            return {
                "error": f"Negotiation analysis failed: {str(e)}",
                "priorities": [],
                "strategies": {},
                "cost_savings": [],
                "risk_mitigation": [],
                "contract_tips": []
            }
    
    def get_financial_advice(self, query: str, context: Dict[str, Any]) -> str:
        """Get general financial advice using the agent"""
        try:
            prompt = f"""
            Context: {json.dumps(context)}
            Query: {query}
            
            Please provide comprehensive financial advice for this SME based on the context.
            """
            
            result = self.agent.run(prompt)
            return result
        except Exception as e:
            return f"Unable to provide advice: {str(e)}"
    
    def _analyze_budget(self, budget_data: str) -> str:
        """Analyze budget performance"""
        return f"Budget analysis: {budget_data}"
    
    def _analyze_cash_flow(self, cash_flow_data: str) -> str:
        """Analyze cash flow patterns"""
        return f"Cash flow analysis: {cash_flow_data}"
    
    def _calculate_credit_score(self, credit_data: str) -> str:
        """Calculate credit score"""
        return f"Credit score calculation: {credit_data}"
    
    def _analyze_supplier_negotiation(self, supplier_data: str) -> str:
        """Analyze supplier negotiation opportunities"""
        return f"Supplier negotiation analysis: {supplier_data}"


class FinancialChatbot:
    """Financial chatbot using LangChain for conversational AI"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.llm = OpenAI(
            temperature=0.7,
            max_tokens=500,
            openai_api_key=self.openai_api_key
        )
        
        # Chat template
        self.chat_template = """
        You are a helpful financial advisor for small and medium enterprises (SMEs) in Kenya.
        You specialize in:
        - Financial planning and budgeting
        - Cash flow management
        - Credit scoring and loan applications
        - Supplier negotiations
        - Growth strategies
        - eTIMS compliance
        - M-Pesa integration
        
        Context about the business:
        {context}
        
        User's question: {question}
        
        Please provide helpful, actionable advice. Be specific and practical.
        If you need more information, ask clarifying questions.
        """
        
        self.chat_chain = LLMChain(
            llm=self.llm,
            prompt=PromptTemplate(
                template=self.chat_template,
                input_variables=["context", "question"]
            )
        )
    
    def chat(self, question: str, business_context: Dict[str, Any] = None) -> str:
        """Chat with the financial advisor"""
        try:
            context = business_context or {}
            result = self.chat_chain.run(
                context=json.dumps(context),
                question=question
            )
            return result
        except Exception as e:
            return f"I'm sorry, I encountered an error: {str(e)}. Please try again."
    
    def get_quick_insights(self, financial_summary: Dict[str, Any]) -> str:
        """Get quick financial insights"""
        question = "Based on this financial summary, what are the key insights and immediate actions I should take?"
        
        return self.chat(question, financial_summary)
    
    def get_growth_recommendations(self, business_data: Dict[str, Any]) -> str:
        """Get growth recommendations"""
        question = "What growth strategies would you recommend for this business?"
        
        return self.chat(question, business_data)
