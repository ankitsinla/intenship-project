const { assert } = require('chai');

const Invoice = artifacts.require("Invoice");

require('chai').use(require('chai-as-promised')).should()

contract("Invoice contract",async (accountns) => {
        let invoice ;
        before(async () => {
            invoice = await Invoice.deployed()
        })

        describe('contract deployment',async () => {
            it('Deployment successful', async () => {
                const address = invoice.address
                assert.notEqual(address, 0x0)
                assert.notEqual(address, '')
                assert.notEqual(address, null)
                assert.notEqual(address, undefined)
            })
            it('Initial invoice no is 0', async () => {
                let invoiceNo = await invoice.invoiceNo()
                assert.equal(invoiceNo,0)
            })
        })

        describe('Generate invoice', async () => {
            let invoiceResult 
            before(async () => {
                invoiceResult = await invoice.generateInvoice('buyer123','seller123',100,false)
            })
            it('Invoice generating', async ()=>{
                let event = invoiceResult.logs[0].args
                
                //success
                let invoiceNo = await invoice.invoiceNo()
                assert.equal(invoiceNo,1,'Invoice no updated to 1')
                assert.equal(event.BuyerPan,'buyer123','correct buyer Pan')
                assert.equal(event.SellerPan,'seller123','correct seller Pan')
                assert.equal(event.Amount,100,'correct amount')
                assert.equal(event.PaymentStatus,false,'correct payment status')

                //failure
                await invoice.generateInvoice('','seller123',100,false).should.be.rejected  
                await invoice.generateInvoice('buyer123','',100,false).should.be.rejected
                await invoice.generateInvoice('buyer213','seller123',-1,false).should.be.rejected
            })

            it('Payment status check',async () => {
                let invoiceNo =1
                let pmtSts = await invoice.checkPmtStatus(invoiceNo)

                assert.equal(pmtSts,false,'Payment status is correct')
            })

            it('Update Payment status',async () => {
                let invoiceNo =1
                await invoice.updatePmtStatus(invoiceNo)
                
                let pmtSts = await invoice.checkPmtStatus(invoiceNo)
                assert.equal(pmtSts,true,'Payment status updated successfully')
            })

            it('Get buyer invoices',async () => {
                let buyerPan = 'buyer123'
                let buyerInvoices = await invoice.getBuyerInvoices(buyerPan)

                assert.equal(buyerInvoices[0],1,'buyer invoices are correct')
            })
        })
    }
)