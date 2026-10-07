import mongoose from 'mongoose';

const PublicProcurementSchema = new mongoose.Schema({
    clientUsername: { type: String, required: true },
    items: { type: Array, required: true },
    totalBudgetEstimate: { type: Number },
    status: { type: String, default: 'otvoreno' }, // 'otvoreno', 'zavrseno', 'isteklo_bez_ponuda'
    endTime: { type: Date, required: true },
    bids: [{
        printerId: String,
        printerName: String,
        totalOfferPrice: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    winningPrinterId: { type: String, default: null },
    winningPrinterName: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('PublicProcurement', PublicProcurementSchema, 'public_procurements');