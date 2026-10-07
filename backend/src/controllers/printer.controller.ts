import express from 'express';
import User from '../models/user';
import Product from '../models/product';
import Order from '../models/order';
import PublicProcurement from '../models/public-procurement';

export class PrinterController {

    // Preuzima i vraća profil ulogovanog štampara na osnovu prosleđenog korisničkog imena iz URL-a.
    getProfile = (req: express.Request, res: express.Response): void => {
        const username = req.params.username;

        User.findOne({ username: username })
            .then((user: any) => {
                if (!user) {
                    res.status(404).json({ message: 'Štampar nije pronađen' });
                    return;
                }
                // Uklanjanje lozinke iz bezbednosnih razloga pre slanja podataka na frontend
                const { password, ...profileData } = user.toObject();
                res.json(profileData);
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju profila', error: err }));
    }

    // Ažurira osnovne podatke profila štampara usklađeno sa poljima u bazi podataka.
    updateProfile = (req: express.Request, res: express.Response): void => {
        const { username, name, surname, email, phone, institutionName, address, profileImage } = req.body;

        User.findOneAndUpdate(
            { username: username },
            { 
                $set: { 
                    name, 
                    surname, 
                    email, 
                    phone, 
                    institutionName, 
                    address,
                    ...(profileImage && { profileImage }) // Ažurira sliku samo ako je prosleđena
                } 
            },
            { new: true }
        )
        .then((updatedUser) => {
            if (!updatedUser) {
                res.status(404).json({ message: 'Štampar nije pronađen' });
                return;
            }
            res.json({ message: 'Profil je uspešno ažuriran', user: updatedUser });
        })
        .catch((err) => res.status(500).json({ message: 'Greška pri ažuriranju profila', error: err }));
    }

    // Dodaje novi proizvod u sistem za određenog štampara uz prethodnu proveru jedinstvenosti koda.
    addProduct = (req: express.Request, res: express.Response): void => {
    
        const { 
            printerId, 
            printerName, 
            code, 
            name, 
            description, 
            category, 
            subcategory, 
            unitPrice, 
            stockQuantity, 
            availableColors, 
            additionalImages, 
            printServices 
        } = req.body;

        // Fizički fajl koji je multer sačuvao ili podrazumevana slika
        const finalImageUrl = req.file ? req.file.filename : 'default_profile_image.jpg';

        // Provera da li su popunjena sva obavezna polja
        if (!code || !name || !unitPrice || !printerId) {
            res.status(400).json({ message: 'Molimo popunite sva obavezna polja (kod, naziv, cena, ID štampara).' });
            return;
        }

        // Provera da li proizvod sa istim jedinstvenim kodom već postoji
        Product.findOne({ code: code })
            .then((existingProduct) => {
                if (existingProduct) {
                    res.status(400).json({ message: 'Proizvod sa unetim kodom već postoji.' });
                    return;
                }

                // Parsiranje boja iz JSON stringa u pravi JavaScript niz
                let parsedColors = [];
                try {
                    parsedColors = availableColors ? JSON.parse(availableColors) : [];
                } catch (e) {
                    parsedColors = [];
                }

                // Parsiranje dodatnih usluga iz JSON stringa u pravi JavaScript niz
                let parsedServices = [];
                try {
                    parsedServices = printServices ? JSON.parse(printServices) : [];
                } catch (e) {
                    parsedServices = [];
                }

                // Kreiranje nove instance proizvoda
                const newProduct = new Product({
                    printerId,
                    printerName,
                    code,
                    name,
                    description,
                    category,
                    subcategory,
                    unitPrice,
                    stockQuantity: stockQuantity || 0,
                    availableColors: parsedColors,
                    imageUrl: finalImageUrl, 
                    additionalImages: additionalImages || [],
                    printServices: parsedServices,
                    likesCount: 0,
                    dislikesCount: 0,
                    comments: []
                });

                // Čuvanje novog proizvoda u bazi
                newProduct.save()
                    .then((savedProduct) => {
                        res.status(201).json({ message: 'Proizvod je uspešno dodat', product: savedProduct });
                    })
                    .catch((err) => res.status(500).json({ message: 'Greška pri čuvanju proizvoda', error: err }));
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri proveri proizvoda', error: err }));
    }

    // Vraća kompletnu listu svih proizvoda koje nudi specifični štampar.
    getProductsByPrinter = (req: express.Request, res: express.Response): void => {
        const printerId = req.params.printerId;

        Product.find({ printerId: printerId })
            .then((products) => {
                res.json(products);
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri učitavanju proizvoda štampara', error: err });
            });
    }

    // Ažurira trenutnu raspoloživu količinu (lager) određenog proizvoda.
    updateStock = (req: express.Request, res: express.Response): void => {
        let productId = req.body.productId;
        let newQuantity = req.body.stockQuantity;

        Product.findByIdAndUpdate(
            productId, 
            { $set: { stockQuantity: newQuantity } },
            { new: true }
        )
        .then((updatedProduct) => {
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Proizvod nije pronađen.' });
            }
            res.json({ message: 'Količina uspešno ažurirana!', product: updatedProduct });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri ažuriranju količine', error: err });
        });
    }

    // Omogućava masovni uvoz proizvoda i lager liste iz JSON fajla ili niza podataka.
    importProductsFromJson = (req: express.Request, res: express.Response): void => {

        const { printerId, printerName } = req.body;
        const products = req.body.products || req.body.proizvodi;

        // Podržava direktan niz u telu zahteva ili objekat sa ključem proizvodi/products
        const listProducts = products || req.body.products || (Array.isArray(req.body) ? req.body : null);

        if (!listProducts || !Array.isArray(listProducts) || listProducts.length === 0) {
            res.status(400).json({ message: 'JSON fajl ne sadrži proizvode.' });
            return;
        }

        let index = 0;
        let savedProducts: any[] = [];

        // Rekurzivna funkcija za serijsku obradu i upis proizvoda u bazu
        const saveNext = () => {
            if (index >= listProducts.length) {
                res.status(201).json({ 
                    message: 'Uspešno uvezena lager lista!', 
                    count: savedProducts.length,
                    products: savedProducts 
                });
                return;
            }

            let p = listProducts[index];
            const currentPrinterId = printerId || p.printerId;
            const currentCode = p.code;

            const productData = {
                printerId: currentPrinterId,
                printerName: printerName || p.printerName || '',
                code: currentCode,
                name: p.name,
                description: p.description || '',
                category: p.category || '',
                subcategory: p.subcategory || '',
                unitPrice: p.unitPrice !== undefined ? p.unitPrice : 0,
                stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 0,
                availableColors: p.availableColors || [],
                imageUrl: p.imageUrl || '',
                additionalImages: p.additionalImages || [],
                printServices: (p.printServices || []).map((usluga: any) => ({
                    serviceId: usluga.serviceId,
                    printType: usluga.printType,
                    additionalPricePerPiece: usluga.additionalPricePerPiece,
                    maxWidthMm: usluga.maxWidthMm,
                    maxHeightMm: usluga.maxHeightMm
                })),
                likesCount: p.likesCount || 0,
                dislikesCount: p.dislikesCount || 0,
                comments: p.comments || []
            };

            // Ažuriranje postojećeg ili ubacivanje novog proizvoda (upsert operacija)
            Product.findOneAndUpdate(
                { code: currentCode, printerId: currentPrinterId },
                { $set: productData },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
            .then((updatedOrInserted) => {
                savedProducts.push(updatedOrInserted);
                index++;
                saveNext(); // Prelazi na obradu sledećeg proizvoda
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri uvozu proizvoda', error: err });
            });
        };

        saveNext();
    }

    // Preuzima i vraća sve narudžbine koje su upućene određenom štamparu.
    getOrdersByPrinter = (req: express.Request, res: express.Response): void => {
        const printerId = req.params.printerId;

        Order.find({ printerId: printerId })
            .then((orders) => {
                res.json(orders);
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri učitavanju narudžbina', error: err });
            });
    }

    // Vrši proveru i ažurira status narudžbine po definisanim poslovnim koracima (naručeno -> u štampi -> isporučeno).
    updateOrderStatus = (req: express.Request, res: express.Response): void => {
        const { orderId } = req.body;
        
        Order.findById(orderId)
            .then((order: any) => {
                if (!order) {
                    res.status(404).json({ message: 'Narudžbina nije pronađena.' });
                    return;
                }

                let currentStatus = order.status;
                let nextStatus = '';

                // Određivanje dozvoljenog prelaza u sledeće stanje
                if (currentStatus === 'placeno' || currentStatus === 'naruceno') {
                    nextStatus = 'u stampi';
                } else if (currentStatus === 'u stampi') {
                    nextStatus = 'isporuceno';
                } else {
                    res.status(400).json({ message: 'Nije moguća dalja promena statusa za ovu stavku.' });
                    return;
                }

                order.status = nextStatus;

                order.save()
                    .then(() => {
                        res.json({ message: 'Status uspešno promenjen!' });
                    })
                    .catch((err: any) => {
                        res.status(500).json({ message: 'Greška pri čuvanju novog statusa', error: err });
                    });
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri pretrazi narudžbine', error: err });
            });
    }

    // Omogućava štamparu da podnese ili ažurira svoju ponudu na aktivnom postupku javne nabavke pre isteka vremena.
    submitBid = (req: express.Request, res: express.Response): void => {
        const { procurementId } = req.params; 
        const { printerId, printerName, totalOfferPrice } = req.body;

        PublicProcurement.findById(procurementId)
            .then((procurement: any) => {
                if (!procurement) {
                    res.status(404).json({ message: 'Javna nabavka nije pronađena' });
                    return;
                }

                // Provera da li je javna nabavka otvoreno i da li je isteklo vreme za licitaciju
                if (procurement.status !== 'otvoreno' || new Date() > new Date(procurement.endTime)) {
                    res.status(400).json({ message: 'Vreme za slanje ponuda za ovu javnu nabavku je isteklo' });
                    return;
                }

                // Provera da li je ova štamparija već poslala ponudu ranije
                const existingBidIndex = procurement.bids.findIndex((b: any) => b.printerId.toString() === printerId);

                if (existingBidIndex > -1) {
                    // Ažuriranje postojeće ponude štampara
                    procurement.bids[existingBidIndex].totalOfferPrice = totalOfferPrice;
                    procurement.bids[existingBidIndex].createdAt = new Date();
                } else {
                    // Dodavanje nove ponude u niz ponuda
                    procurement.bids.push({
                        printerId,
                        printerName,
                        totalOfferPrice,
                        createdAt: new Date()
                    });
                }

                procurement.save()
                    .then((updatedProcurement: any) => {
                        res.status(200).json({ message: 'Ponuda je uspešno poslata', procurement: updatedProcurement });
                    })
                    .catch((err: any) => {
                        res.status(500).json({ message: 'Greška pri čuvanju ponude', error: err });
                    });
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška na serveru', error: err });
            });
    }

    // Vraća listu svih aktivnih javnih nabavki na koje štampar može da šalje ponude.
    getActiveProcurements = (req: express.Request, res: express.Response): void => {
        PublicProcurement.find({ status: 'otvoreno', endTime: { $gt: new Date() } })
            .then((procurements) => {
                res.status(200).json(procurements);
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri preuzimanju javnih nabavki', error: err });
            });
    }
}