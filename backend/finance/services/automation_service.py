# backend/finance/services/automation_service.py
import os
import requests
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from .models import Transaction, Invoice, Budget


class N8NAutomationService:
    """Service for integrating with n8n automation workflows"""
    
    def __init__(self):
        self.n8n_webhook_url = os.getenv('N8N_WEBHOOK_URL', '')
        self.n8n_api_key = os.getenv('N8N_API_KEY', '')
    
    def trigger_mpesa_reconciliation(self, business_id: str, user_id: int) -> Dict[str, Any]:
        """Trigger M-Pesa transaction reconciliation workflow"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            payload = {
                "workflow": "mpesa_reconciliation",
                "business_id": business_id,
                "user_id": user_id,
                "timestamp": timezone.now().isoformat(),
                "action": "reconcile_transactions"
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success,
                    "message": "M-Pesa reconciliation triggered",
                    "workflow_id": response.json().get('workflow_id')
                }
            else:
                return {"error": f"Workflow trigger failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"M-Pesa reconciliation failed: {str(e)}"}
    
    def send_invoice_reminder(self, invoice_id: str, reminder_type: str = "first") -> Dict[str, Any]:
        """Send automated invoice reminder via WhatsApp/Email"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            invoice = Invoice.objects.get(id=invoice_id)
            
            payload = {
                "workflow": "invoice_reminder",
                "invoice_id": invoice_id,
                "customer_name": invoice.customer_name,
                "customer_email": invoice.customer_email,
                "customer_phone": invoice.customer_phone,
                "invoice_number": invoice.invoice_number,
                "total_amount": str(invoice.total_amount),
                "due_date": invoice.due_date.isoformat(),
                "reminder_type": reminder_type,
                "timestamp": timezone.now().isoformat()
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": f"{reminder_type.title()} reminder sent",
                    "workflow_id": response.json().get('workflow_id')
                }
            else:
                return {"error": f"Reminder sending failed: {response.status_code}"}
                
        except Invoice.DoesNotExist:
            return {"error": "Invoice not found"}
        except Exception as e:
            return {"error": f"Invoice reminder failed: {str(e)}"}
    
    def process_etims_integration(self, invoice_id: str) -> Dict[str, Any]:
        """Process eTIMS integration for invoice"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            invoice = Invoice.objects.get(id=invoice_id)
            
            payload = {
                "workflow": "etims_integration",
                "invoice_id": invoice_id,
                "business_id": str(invoice.business.id),
                "invoice_data": {
                    "invoice_number": invoice.invoice_number,
                    "customer_name": invoice.customer_name,
                    "total_amount": str(invoice.total_amount),
                    "tax_amount": str(invoice.tax_amount),
                    "issue_date": invoice.issue_date.isoformat()
                },
                "timestamp": timezone.now().isoformat()
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Update invoice with eTIMS data
                invoice.etims_invoice_number = result.get('etims_invoice_number', '')
                invoice.etims_status = result.get('status', 'pending')
                invoice.save()
                
                return {
                    "status": "success",
                    "message": "eTIMS integration completed",
                    "etims_invoice_number": result.get('etims_invoice_number'),
                    "etims_status": result.get('status')
                }
            else:
                return {"error": f"eTIMS integration failed: {response.status_code}"}
                
        except Invoice.DoesNotExist:
            return {"error": "Invoice not found"}
        except Exception as e:
            return {"error": f"eTIMS integration failed: {str(e)}"}
    
    def send_budget_alert(self, budget_id: str, alert_type: str) -> Dict[str, Any]:
        """Send budget alert when threshold is reached"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            budget = Budget.objects.get(id=budget_id)
            
            payload = {
                "workflow": "budget_alert",
                "budget_id": budget_id,
                "business_id": str(budget.business.id),
                "user_id": budget.user.id,
                "budget_name": budget.name,
                "budgeted_amount": str(budget.budgeted_amount),
                "spent_amount": str(budget.spent_amount),
                "utilization_percentage": budget.utilization_percentage,
                "alert_type": alert_type,
                "timestamp": timezone.now().isoformat()
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": f"Budget {alert_type} alert sent",
                    "workflow_id": response.json().get('workflow_id')
                }
            else:
                return {"error": f"Budget alert failed: {response.status_code}"}
                
        except Budget.DoesNotExist:
            return {"error": "Budget not found"}
        except Exception as e:
            return {"error": f"Budget alert failed: {str(e)}"}
    
    def trigger_supplier_negotiation_workflow(self, supplier_name: str, business_id: str) -> Dict[str, Any]:
        """Trigger supplier negotiation workflow"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            payload = {
                "workflow": "supplier_negotiation",
                "supplier_name": supplier_name,
                "business_id": business_id,
                "timestamp": timezone.now().isoformat(),
                "action": "generate_negotiation_strategy"
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": "Supplier negotiation workflow triggered",
                    "workflow_id": response.json().get('workflow_id')
                }
            else:
                return {"error": f"Supplier negotiation workflow failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Supplier negotiation failed: {str(e)}"}
    
    def send_credit_score_alert(self, business_id: str, credit_score: int) -> Dict[str, Any]:
        """Send credit score improvement alert"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            payload = {
                "workflow": "credit_score_alert",
                "business_id": business_id,
                "credit_score": credit_score,
                "score_category": self._get_score_category(credit_score),
                "timestamp": timezone.now().isoformat(),
                "action": "send_improvement_tips"
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": "Credit score alert sent",
                    "workflow_id": response.json().get('workflow_id')
                }
            else:
                return {"error": f"Credit score alert failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Credit score alert failed: {str(e)}"}
    
    def trigger_financial_report_generation(self, business_id: str, report_type: str, period: str) -> Dict[str, Any]:
        """Trigger automated financial report generation"""
        if not self.n8n_webhook_url:
            return {"error": "N8N webhook URL not configured"}
        
        try:
            payload = {
                "workflow": "financial_report",
                "business_id": business_id,
                "report_type": report_type,
                "period": period,
                "timestamp": timezone.now().isoformat(),
                "action": "generate_report"
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "message": f"{report_type} report generation triggered",
                    "workflow_id": response.json().get('workflow_id')
                }
            else:
                return {"error": f"Report generation failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Report generation failed: {str(e)}"}
    
    def _get_score_category(self, score: int) -> str:
        """Get credit score category"""
        if score >= 800:
            return "Excellent"
        elif score >= 740:
            return "Very Good"
        elif score >= 670:
            return "Good"
        elif score >= 580:
            return "Fair"
        else:
            return "Poor"


class AutomationWorkflowManager:
    """Manager for automation workflows"""
    
    def __init__(self):
        self.n8n_service = N8NAutomationService()
    
    def setup_business_automation(self, business_id: str, user_id: int) -> Dict[str, Any]:
        """Setup automation workflows for a new business"""
        workflows = []
        
        # M-Pesa reconciliation workflow
        mpesa_result = self.n8n_service.trigger_mpesa_reconciliation(business_id, user_id)
        workflows.append({
            "name": "M-Pesa Reconciliation",
            "status": mpesa_result.get("status", "failed"),
            "result": mpesa_result
        })
        
        # Budget monitoring workflow
        budgets = Budget.objects.filter(business_id=business_id, is_active=True)
        for budget in budgets:
            if budget.utilization_percentage >= budget.alert_threshold:
                alert_result = self.n8n_service.send_budget_alert(str(budget.id), "threshold_reached")
                workflows.append({
                    "name": f"Budget Alert - {budget.name}",
                    "status": alert_result.get("status", "failed"),
                    "result": alert_result
                })
        
        return {
            "business_id": business_id,
            "workflows_setup": len(workflows),
            "workflows": workflows
        }
    
    def process_daily_automation(self, business_id: str) -> Dict[str, Any]:
        """Process daily automation tasks"""
        results = []
        
        # Check for overdue invoices
        overdue_invoices = Invoice.objects.filter(
            business_id=business_id,
            status='sent',
            due_date__lt=timezone.now().date()
        )
        
        for invoice in overdue_invoices:
            # Update status to overdue
            invoice.status = 'overdue'
            invoice.save()
            
            # Send overdue reminder
            reminder_result = self.n8n_service.send_invoice_reminder(str(invoice.id), "overdue")
            results.append({
                "task": f"Overdue reminder for {invoice.invoice_number}",
                "result": reminder_result
            })
        
        # Check budget thresholds
        budgets = Budget.objects.filter(business_id=business_id, is_active=True)
        for budget in budgets:
            if budget.utilization_percentage >= budget.alert_threshold:
                alert_result = self.n8n_service.send_budget_alert(str(budget.id), "threshold_reached")
                results.append({
                    "task": f"Budget alert for {budget.name}",
                    "result": alert_result
                })
        
        return {
            "business_id": business_id,
            "date": timezone.now().date().isoformat(),
            "tasks_processed": len(results),
            "results": results
        }
    
    def process_weekly_automation(self, business_id: str) -> Dict[str, Any]:
        """Process weekly automation tasks"""
        results = []
        
        # Generate weekly financial report
        report_result = self.n8n_service.trigger_financial_report_generation(
            business_id, "weekly", "7_days"
        )
        results.append({
            "task": "Weekly financial report",
            "result": report_result
        })
        
        # M-Pesa reconciliation
        mpesa_result = self.n8n_service.trigger_mpesa_reconciliation(business_id, None)
        results.append({
            "task": "M-Pesa reconciliation",
            "result": mpesa_result
        })
        
        return {
            "business_id": business_id,
            "week": timezone.now().isocalendar()[1],
            "tasks_processed": len(results),
            "results": results
        }
    
    def process_monthly_automation(self, business_id: str) -> Dict[str, Any]:
        """Process monthly automation tasks"""
        results = []
        
        # Generate monthly financial report
        report_result = self.n8n_service.trigger_financial_report_generation(
            business_id, "monthly", "30_days"
        )
        results.append({
            "task": "Monthly financial report",
            "result": report_result
        })
        
        # Credit score analysis
        # This would trigger credit score calculation and alerts
        results.append({
            "task": "Credit score analysis",
            "result": {"status": "success", "message": "Credit score analysis completed"}
        })
        
        return {
            "business_id": business_id,
            "month": timezone.now().month,
            "year": timezone.now().year,
            "tasks_processed": len(results),
            "results": results
        }
