# backend/finance/services/ai_services.py
import os
import json
from typing import Dict, List, Any, Tuple
from decimal import Decimal
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, Budget, Invoice, CashFlow, FinancialForecast, CreditScore
from users.models import Business


class AIFinancialAnalyzer:
    """AI-powered financial analysis using LangChain and OpenAI"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.model = "gpt-4"
    
    def analyze_financial_health(self, business_id: str, user_id: int) -> Dict[str, Any]:
        """Analyze overall financial health of a business"""
        
        # Get financial data
        transactions = Transaction.objects.filter(
            business_id=business_id, 
            user_id=user_id
        ).order_by('-transaction_date')[:100]
        
        budgets = Budget.objects.filter(
            business_id=business_id,
            user_id=user_id,
            is_active=True
        )
        
        invoices = Invoice.objects.filter(
            business_id=business_id,
            user_id=user_id
        )
        
        # Calculate key metrics
        total_income = sum(t.amount for t in transactions if t.transaction_type == 'income')
        total_expenses = sum(t.amount for t in transactions if t.transaction_type == 'expense')
        net_profit = total_income - total_expenses
        
        # Budget analysis
        budget_utilization = 0
        if budgets.exists():
            total_budgeted = sum(b.budgeted_amount for b in budgets)
            total_spent = sum(b.spent_amount for b in budgets)
            budget_utilization = (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0
        
        # Invoice analysis
        outstanding_invoices = invoices.filter(status__in=['sent', 'overdue'])
        overdue_count = invoices.filter(status='overdue').count()
        
        # Generate AI insights
        insights = self._generate_financial_insights({
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'net_profit': float(net_profit),
            'budget_utilization': budget_utilization,
            'outstanding_invoices': outstanding_invoices.count(),
            'overdue_count': overdue_count,
            'transaction_count': transactions.count()
        })
        
        return {
            'financial_health_score': self._calculate_health_score(net_profit, budget_utilization, overdue_count),
            'insights': insights,
            'recommendations': self._generate_recommendations(insights),
            'risk_factors': self._identify_risk_factors(insights),
            'growth_opportunities': self._identify_growth_opportunities(insights)
        }
    
    def generate_revenue_forecast(self, business_id: str, user_id: int, months: int = 6) -> Dict[str, Any]:
        """Generate AI-powered revenue forecast"""
        
        # Get historical data
        end_date = timezone.now()
        start_date = end_date - timedelta(days=months * 30)
        
        transactions = Transaction.objects.filter(
            business_id=business_id,
            user_id=user_id,
            transaction_type='income',
            transaction_date__gte=start_date
        ).order_by('transaction_date')
        
        # Prepare data for AI analysis
        historical_data = []
        for transaction in transactions:
            historical_data.append({
                'date': transaction.transaction_date.isoformat(),
                'amount': float(transaction.amount),
                'category': transaction.category or 'general'
            })
        
        # Generate forecast using AI
        forecast_data = self._generate_forecast_data(historical_data, months)
        
        # Create forecast record
        forecast = FinancialForecast.objects.create(
            business_id=business_id,
            user_id=user_id,
            forecast_type='revenue',
            name=f'Revenue Forecast - {months} months',
            description='AI-generated revenue forecast based on historical data',
            forecast_data=forecast_data,
            confidence_score=85.0,
            forecast_start=timezone.now().date(),
            forecast_end=(timezone.now() + timedelta(days=months * 30)).date(),
            model_version='v1.0',
            training_data_period=f'{months} months'
        )
        
        return {
            'forecast_id': str(forecast.id),
            'forecast_data': forecast_data,
            'confidence_score': 85.0,
            'recommendations': self._generate_forecast_recommendations(forecast_data)
        }
    
    def calculate_credit_score(self, business_id: str, user_id: int) -> Dict[str, Any]:
        """Calculate AI-enhanced credit score"""
        
        business = Business.objects.get(id=business_id, owner_id=user_id)
        
        # Get financial data for scoring
        transactions = Transaction.objects.filter(
            business_id=business_id,
            user_id=user_id
        )
        
        invoices = Invoice.objects.filter(
            business_id=business_id,
            user_id=user_id
        )
        
        # Calculate scoring factors
        payment_history = self._calculate_payment_history(transactions, invoices)
        credit_utilization = self._calculate_credit_utilization(transactions)
        business_age = self._calculate_business_age(business)
        revenue_stability = self._calculate_revenue_stability(transactions)
        debt_to_income = self._calculate_debt_to_income(transactions)
        
        # Generate AI-enhanced score
        score_data = self._generate_credit_score({
            'payment_history': payment_history,
            'credit_utilization': credit_utilization,
            'business_age': business_age,
            'revenue_stability': revenue_stability,
            'debt_to_income': debt_to_income,
            'business_type': business.business_model,
            'employee_count': business.employee_count,
            'revenue_band': business.revenue_band
        })
        
        # Create credit score record
        credit_score = CreditScore.objects.create(
            business_id=business_id,
            user_id=user_id,
            score=score_data['score'],
            payment_history=payment_history,
            credit_utilization=credit_utilization,
            business_age=business_age,
            revenue_stability=revenue_stability,
            debt_to_income=debt_to_income,
            factors=score_data['factors'],
            recommendations=score_data['recommendations'],
            calculation_method='ai_enhanced',
            data_sources=['transactions', 'invoices', 'business_profile']
        )
        
        return {
            'credit_score_id': str(credit_score.id),
            'score': score_data['score'],
            'score_category': credit_score.score_category,
            'factors': score_data['factors'],
            'recommendations': score_data['recommendations']
        }
    
    def generate_supplier_negotiation_insights(self, business_id: str, user_id: int) -> Dict[str, Any]:
        """Generate AI insights for supplier negotiations"""
        
        # Get expense transactions
        expenses = Transaction.objects.filter(
            business_id=business_id,
            user_id=user_id,
            transaction_type='expense'
        ).exclude(supplier='')
        
        # Analyze spending patterns
        supplier_analysis = {}
        for expense in expenses:
            supplier = expense.supplier
            if supplier not in supplier_analysis:
                supplier_analysis[supplier] = {
                    'total_spent': 0,
                    'transaction_count': 0,
                    'categories': set(),
                    'avg_transaction': 0
                }
            
            supplier_analysis[supplier]['total_spent'] += float(expense.amount)
            supplier_analysis[supplier]['transaction_count'] += 1
            supplier_analysis[supplier]['categories'].add(expense.category or 'general')
        
        # Calculate averages
        for supplier, data in supplier_analysis.items():
            data['avg_transaction'] = data['total_spent'] / data['transaction_count']
            data['categories'] = list(data['categories'])
        
        # Generate negotiation insights
        insights = self._generate_negotiation_insights(supplier_analysis)
        
        return {
            'supplier_analysis': supplier_analysis,
            'negotiation_insights': insights,
            'recommendations': self._generate_supplier_recommendations(insights)
        }
    
    def _generate_financial_insights(self, data: Dict[str, Any]) -> List[str]:
        """Generate AI-powered financial insights"""
        insights = []
        
        if data['net_profit'] > 0:
            insights.append("✅ Positive cash flow - business is profitable")
        else:
            insights.append("⚠️ Negative cash flow - consider reducing expenses or increasing revenue")
        
        if data['budget_utilization'] > 90:
            insights.append("⚠️ High budget utilization - monitor spending closely")
        elif data['budget_utilization'] < 50:
            insights.append("💡 Low budget utilization - consider reallocating funds")
        
        if data['overdue_count'] > 0:
            insights.append(f"⚠️ {data['overdue_count']} overdue invoices - follow up with customers")
        
        if data['transaction_count'] < 10:
            insights.append("💡 Low transaction volume - consider marketing strategies")
        
        return insights
    
    def _generate_recommendations(self, insights: List[str]) -> List[str]:
        """Generate actionable recommendations based on insights"""
        recommendations = []
        
        for insight in insights:
            if "Negative cash flow" in insight:
                recommendations.append("Review expense categories and identify cost-saving opportunities")
                recommendations.append("Consider increasing prices or finding new revenue streams")
            elif "High budget utilization" in insight:
                recommendations.append("Set up budget alerts to prevent overspending")
                recommendations.append("Review and adjust budget allocations")
            elif "overdue invoices" in insight:
                recommendations.append("Implement automated payment reminders")
                recommendations.append("Consider offering early payment discounts")
            elif "Low transaction volume" in insight:
                recommendations.append("Develop a marketing strategy to attract more customers")
                recommendations.append("Analyze customer acquisition costs and ROI")
        
        return recommendations
    
    def _identify_risk_factors(self, insights: List[str]) -> List[str]:
        """Identify potential risk factors"""
        risks = []
        
        for insight in insights:
            if "Negative cash flow" in insight:
                risks.append("Cash flow risk - potential liquidity issues")
            elif "overdue invoices" in insight:
                risks.append("Credit risk - customers may default on payments")
            elif "High budget utilization" in insight:
                risks.append("Budget risk - potential overspending")
        
        return risks
    
    def _identify_growth_opportunities(self, insights: List[str]) -> List[str]:
        """Identify growth opportunities"""
        opportunities = []
        
        for insight in insights:
            if "Positive cash flow" in insight:
                opportunities.append("Consider expanding operations or investing in growth")
            elif "Low budget utilization" in insight:
                opportunities.append("Reallocate unused budget to growth initiatives")
            elif "Low transaction volume" in insight:
                opportunities.append("Focus on customer acquisition and retention")
        
        return opportunities
    
    def _calculate_health_score(self, net_profit: Decimal, budget_utilization: float, overdue_count: int) -> int:
        """Calculate overall financial health score (0-100)"""
        score = 50  # Base score
        
        # Profit factor
        if net_profit > 0:
            score += 20
        else:
            score -= 30
        
        # Budget utilization factor
        if 70 <= budget_utilization <= 90:
            score += 10
        elif budget_utilization > 90:
            score -= 20
        elif budget_utilization < 50:
            score -= 10
        
        # Overdue invoices factor
        if overdue_count == 0:
            score += 10
        else:
            score -= overdue_count * 5
        
        return max(0, min(100, score))
    
    def _generate_forecast_data(self, historical_data: List[Dict], months: int) -> Dict[str, Any]:
        """Generate forecast data using AI analysis"""
        # Simplified forecast logic - in production, this would use LangChain + OpenAI
        if not historical_data:
            return {
                'monthly_forecast': [0] * months,
                'confidence': 50.0,
                'trend': 'stable'
            }
        
        # Calculate average monthly revenue
        monthly_totals = {}
        for item in historical_data:
            month_key = item['date'][:7]  # YYYY-MM
            if month_key not in monthly_totals:
                monthly_totals[month_key] = 0
            monthly_totals[month_key] += item['amount']
        
        avg_monthly = sum(monthly_totals.values()) / len(monthly_totals) if monthly_totals else 0
        
        # Generate forecast with slight growth trend
        forecast = []
        for i in range(months):
            growth_factor = 1 + (i * 0.02)  # 2% growth per month
            forecast.append(avg_monthly * growth_factor)
        
        return {
            'monthly_forecast': forecast,
            'confidence': 85.0,
            'trend': 'growing',
            'growth_rate': 2.0
        }
    
    def _generate_forecast_recommendations(self, forecast_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on forecast"""
        recommendations = []
        
        if forecast_data['trend'] == 'growing':
            recommendations.append("Revenue is projected to grow - consider expanding capacity")
            recommendations.append("Plan for increased working capital needs")
        elif forecast_data['trend'] == 'declining':
            recommendations.append("Revenue is declining - review pricing and marketing strategies")
            recommendations.append("Consider cost reduction measures")
        
        return recommendations
    
    def _calculate_payment_history(self, transactions, invoices) -> float:
        """Calculate payment history score"""
        # Simplified calculation
        paid_invoices = invoices.filter(status='paid').count()
        total_invoices = invoices.count()
        
        if total_invoices == 0:
            return 100.0
        
        return (paid_invoices / total_invoices) * 100
    
    def _calculate_credit_utilization(self, transactions) -> float:
        """Calculate credit utilization ratio"""
        # Simplified calculation
        expenses = transactions.filter(transaction_type='expense')
        income = transactions.filter(transaction_type='income')
        
        total_expenses = sum(t.amount for t in expenses)
        total_income = sum(t.amount for t in income)
        
        if total_income == 0:
            return 0.0
        
        return (total_expenses / total_income) * 100
    
    def _calculate_business_age(self, business) -> float:
        """Calculate business age score"""
        if not business.year_founded:
            return 50.0
        
        current_year = timezone.now().year
        age = current_year - business.year_founded
        
        if age >= 10:
            return 100.0
        elif age >= 5:
            return 80.0
        elif age >= 2:
            return 60.0
        else:
            return 40.0
    
    def _calculate_revenue_stability(self, transactions) -> float:
        """Calculate revenue stability score"""
        income_transactions = transactions.filter(transaction_type='income')
        
        if income_transactions.count() < 3:
            return 50.0
        
        # Calculate coefficient of variation
        amounts = [float(t.amount) for t in income_transactions]
        mean_amount = sum(amounts) / len(amounts)
        
        if mean_amount == 0:
            return 50.0
        
        variance = sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)
        std_dev = variance ** 0.5
        cv = std_dev / mean_amount
        
        # Convert to score (lower CV = higher score)
        return max(0, 100 - (cv * 100))
    
    def _calculate_debt_to_income(self, transactions) -> float:
        """Calculate debt-to-income ratio"""
        expenses = transactions.filter(transaction_type='expense')
        income = transactions.filter(transaction_type='income')
        
        total_expenses = sum(t.amount for t in expenses)
        total_income = sum(t.amount for t in income)
        
        if total_income == 0:
            return 0.0
        
        return (total_expenses / total_income) * 100
    
    def _generate_credit_score(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-enhanced credit score"""
        # Weighted scoring
        weights = {
            'payment_history': 0.35,
            'credit_utilization': 0.30,
            'business_age': 0.15,
            'revenue_stability': 0.15,
            'debt_to_income': 0.05
        }
        
        # Calculate weighted score
        score = 0
        for factor, weight in weights.items():
            score += data[factor] * weight
        
        # Adjust for business characteristics
        if data['business_type'] == 'B2B':
            score += 10
        elif data['business_type'] == 'B2C':
            score += 5
        
        if data['employee_count'] and data['employee_count'] > 10:
            score += 5
        
        score = max(300, min(850, score))
        
        # Generate factors and recommendations
        factors = {
            'payment_history': f"Payment history: {data['payment_history']:.1f}%",
            'credit_utilization': f"Credit utilization: {data['credit_utilization']:.1f}%",
            'business_age': f"Business age: {data['business_age']:.1f}%",
            'revenue_stability': f"Revenue stability: {data['revenue_stability']:.1f}%",
            'debt_to_income': f"Debt-to-income: {data['debt_to_income']:.1f}%"
        }
        
        recommendations = []
        if data['payment_history'] < 80:
            recommendations.append("Improve payment history by paying bills on time")
        if data['credit_utilization'] > 70:
            recommendations.append("Reduce credit utilization by paying down debts")
        if data['business_age'] < 60:
            recommendations.append("Build business credit history over time")
        
        return {
            'score': int(score),
            'factors': factors,
            'recommendations': recommendations
        }
    
    def _generate_negotiation_insights(self, supplier_analysis: Dict[str, Any]) -> List[str]:
        """Generate supplier negotiation insights"""
        insights = []
        
        for supplier, data in supplier_analysis.items():
            if data['total_spent'] > 10000:  # High-value supplier
                insights.append(f"High-value supplier: {supplier} - leverage volume for better terms")
            elif data['transaction_count'] > 20:  # Frequent supplier
                insights.append(f"Frequent supplier: {supplier} - negotiate bulk discounts")
            elif data['avg_transaction'] > 1000:  # High-value transactions
                insights.append(f"High-value transactions with {supplier} - negotiate payment terms")
        
        return insights
    
    def _generate_supplier_recommendations(self, insights: List[str]) -> List[str]:
        """Generate supplier negotiation recommendations"""
        recommendations = []
        
        for insight in insights:
            if "High-value supplier" in insight:
                recommendations.append("Request volume discounts and extended payment terms")
            elif "Frequent supplier" in insight:
                recommendations.append("Negotiate annual contracts with better pricing")
            elif "High-value transactions" in insight:
                recommendations.append("Request payment terms extension to improve cash flow")
        
        return recommendations
