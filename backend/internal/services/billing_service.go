package services

import (
	"context"

	"mediawork/internal/models"
	"mediawork/internal/repositories"
)

type BillingService struct {
	invoices *repositories.InvoiceRepository
	playRepo *repositories.PlayHistoryRepository
}

func NewBillingService(inv *repositories.InvoiceRepository, ph *repositories.PlayHistoryRepository) *BillingService {
	return &BillingService{invoices: inv, playRepo: ph}
}

// ---------- CALCULATE TOTAL COST FOR INVOICE ----------
func (s *BillingService) Calculate(ctx context.Context, companyID int64, start, end string) (float64, error) {
	return s.invoices.CalculateAmountForPeriod(ctx, companyID, start, end)
}

// ---------- BUILD PDF MODEL ----------
func (s *BillingService) PreparePDF(ctx context.Context, invoiceID int64) (*models.InvoicePDF, error) {
	return s.invoices.PreparePDFData(ctx, invoiceID)
}

func (s *BillingService) List(ctx context.Context) ([]models.Invoice, error) {
	return s.invoices.List(ctx) // лимит можешь поменять
}

func (s *BillingService) GetByID(ctx context.Context, id int64) (*models.Invoice, error) {
	return s.invoices.GetByID(ctx, id)
}

// --------------------- CREATE INVOICE ---------------------
func (s *BillingService) Create(ctx context.Context, inv *models.Invoice) (error) {
    return s.invoices.Create(ctx, inv)
}