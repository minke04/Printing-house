import express from 'express';
import User from '../models/user';
import Order from '../models/order';
import Product from "../models/product";
import Category from '../models/category';
import PublicProcurement from '../models/public-procurement';

export class ClientController{

    // Metoda pronalazi i vraća podatke o profilu specifičnog korisnika na osnovu njegovog korisničkog imena, uklanjajući lozinku iz bezbednosnih razloga.
    getProfile = (req: express.Request, res: express.Response): void => {
        // Preuzimanje korisničkog imena iz URL parametara
        const username = req.params.username;

        // Pretraga korisnika u bazi podataka
        User.findOne({ username: username })
        .then((user: any) => {
            // Provera da li korisnik postoji
            if (!user) {
                res.status(404).json({ message: 'Korisnik nije pronađen' });
                return;
            }
            // Uklanjanje lozinke iz objekta pre slanja klijentu
            const { password, ...profileData } = user.toObject();
            res.json(profileData);
        })
        .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju profila', error: err }));
    }

    // Metoda dobavlja i vraća listu svih dostupnih kategorija proizvoda iz baze podataka.
    getCategories = (req: express.Request, res: express.Response): void => {
        // Pretraga svih kategorija bez uslova
        Category.find({})
            .then((categories) => res.json(categories))
            .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju kategorija', error: err }));
    }


    // Metoda ažurira lične podatke i profilnu sliku postojećeg korisnika u bazi.
    updateProfile = (req: express.Request, res: express.Response): void => {
        // Ekstrakcija podataka iz tela zahteva
        const { username, firstname, lastname, email, phone, profileImage } = req.body;

        // Pronalaženje i ažuriranje korisnika prema korisničkom imenu
        User.findOneAndUpdate(
            { username: username },
            { 
                $set: { 
                firstname, 
                lastname, 
                email, 
                phone, 
                ...(profileImage && { profileImage }) // Dinamičko dodavanje slike samo ako je poslata
                } 
            },
            { new: true } // Vraća ažuriranu verziju dokumenta
        )
        .then((updatedUser) => {
            // Provera da li je korisnik uspešno pronađen i izmenjen
            if (!updatedUser) {
                res.status(404).json({ message: 'Korisnik nije pronađen' });
                return;
            }
            res.json({ message: 'Profil je uspešno ažuriran', user: updatedUser });
        })
        .catch((err) => res.status(500).json({ message: 'Greška pri ažuriranju profila', error: err }));
    }


    // Metoda preuzima sve porudžbine specifičnog klijenta koje pripadaju samo odobrenim štamparijama, sortirane od najnovije ka najstarijoj.
    getClientOrders = (req: express.Request, res: express.Response): void => {
        const username = req.params.username;

        // 1. Korak: Prvo pronalazimo sve korisnike koji su odobrene štamparije
        User.find({ role: 'stampar', status: 'approved' })
            .then((approvedPrinters) => {
                const approvedPrinterUsernames = approvedPrinters.map(p => p.username);

                // 2. Korak: Pretraga porudžbina za klijenta, uz uslov da je printerId među odobrenim štamparijama
                return Order.find({ 
                    clientUsername: username,
                    printerId: { $in: approvedPrinterUsernames } // <--- Ključni filter za izbacivanje neaktivnih štamparija
                })
                .sort({ createdAt: -1 }); // Sortiranje po datumu kreiranja opadajuće
            })
            .then((orders) => {
                res.json(orders);
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri preuzimanju porudžbina', error: err });
            });
    }

    // Metoda omogućava otkazivanje porudžbine isključivo ukoliko se ona i dalje nalazi u statusu 'naruceno'.
    cancelOrder = (req: express.Request, res: express.Response): void => {
        // Preuzimanje ID-ja porudžbine iz tela zahteva
        const orderId = req.body.id;

        // Pronalaženje porudžbine po ID-ju
        Order.findById(orderId)
        .then((order: any) => {
            // Provera postojanja porudžbine
            if (!order) {
                res.status(404).json({ message: 'Porudžbina nije pronađena' });
                return;
            }

            // Provera statusa – otkazivanje je dozvoljeno samo u početnoj fazi
            if (order.status !== 'naruceno') {
                res.status(400).json({ message: 'Porudžbina ne može biti otkazana jer je obrada već počela.' });
                return;
            }

            // Brisanje porudžbine iz baze ako su ispunjeni uslovi
            Order.findByIdAndDelete(orderId)
            .then(() => res.json({ message: 'Porudžbina je uspešno otkazana' }))
            .catch((err) => res.status(500).json({ message: 'Greška pri brisanju porudžbine', error: err }));
        })
        .catch((err) => res.status(500).json({ message: 'Greška pri traženju porudžbine', error: err }));
    }


    // Metoda pretražuje proizvode na osnovu zadatih filtera uz obavezan uslov da štamparija mora biti odobrena (Promise chaining)
    searchProducts = (req: express.Request, res: express.Response): void => {
        let { name, category } = req.query;

        // Prvo pronalazimo sve korisnike koji su odobrene štamparije
        User.find({ role: 'stampar', status: 'approved' })
            .then((approvedPrinters) => {
                const approvedPrinterUsernames = approvedPrinters.map(p => p.username);

                // Inicijalizujemo filter sa obaveznim zalihama i dozvoljenim štamparijama
                let filter: any = {
                    stockQuantity: { $gt: 0 },
                    printerId: { $in: approvedPrinterUsernames }
                };

                // Dodavanje filtera po nazivu (ignorišući velika i mala slova)
                if (name && (name as string).trim() !== '') {
                    filter.name = { $regex: name, $options: 'i' };
                }

                // Dodavanje filtera za kategoriju ukoliko nije izabrana opcija za sve
                if (category && category !== 'Sve kategorije' && category !== 'all' && category !== 'All') {
                    filter.category = category;
                }

                // Izvršavanje upita nad bazom proizvoda
                return Product.find(filter);
            })
            .then((products) => {
                res.json(products);
            })
            .catch((err) => {
                res.status(500).json({ message: 'Greška pri pretrazi proizvoda', error: err });
            });
    }

    // Metoda pribavlja i vraća detaljne informacije o specifičnom proizvodu na osnovu njegovog jedinstvenog identifikatora.
    getProductDetails = (req: express.Request, res: express.Response): void => {
        // Preuzimanje ID-ja proizvoda iz parametara rute
        let productId = req.params.id;

        // Pretraga proizvoda po ID-ju
        Product.findById(productId)
            .then((product) => {
                // Provera da li proizvod postoji u bazi
                if (!product) {
                    res.status(404).json({ message: 'Proizvod nije pronađen' });
                    return;
                }
                res.json(product);
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju detalja proizvoda', error: err }));
    }


    // Metoda kreira nove porudžbine grupisane po štamparijama, istovremeno umanjujući zalihe kupljenih artikala.
    createOrders = (req: express.Request, res: express.Response): void => {
        const { clientUsername, groupedItems, totalAmount, status } = req.body;

        // Provera da li je korpa prazna
        if (!groupedItems || groupedItems.length === 0) {
            res.status(400).json({ message: 'Korpa je prazna' });
            return;
        }

        let createdOrders: any[] = [];
        let invoiceCounter = Date.now();

        // Rekurzivna funkcija za obradu i čuvanje svake grupe artikala (štamparije) pojedinačno
        const saveNextGroup = (index: number) => {
            if (index >= groupedItems.length) {
                // Kada su sve grupe obrađene, vraća se konačan odgovor klijentu
                res.status(201).json({ message: 'Porudžbine su uspešno kreirane', orders: createdOrders });
                return;
            }

            const group = groupedItems[index];
            const invoiceId = `FAK-2026-${invoiceCounter++}`;
            
            // Formiranje nove porudžbine za tekuću grupu/štampariju
            const newOrder = new Order({
                invoiceId: invoiceId,
                clientUsername: clientUsername,
                printerId: group.printerId,
                printerName: group.printerName,
                city: group.city,
                items: group.items,
                totalAmount: group.printerTotal,
                status: status || 'placeno',
                createdAt: new Date()
            });

            // Čuvanje porudžbine u bazi
            newOrder.save()
                .then((savedOrder) => {
                    createdOrders.push(savedOrder);

                    // Unutrašnja rekurzivna funkcija za sekvencijalno smanjenje zaliha za svaki artikal u grupi
                    const updateStockForItems = (itemIndex: number) => {
                        if (itemIndex >= group.items.length) {
                            // Prelazak na sledeću štampariju/grupu nakon ažuriranja svih artikala
                            saveNextGroup(index + 1);
                            return;
                        }

                        const item = group.items[itemIndex];
                        Product.findOneAndUpdate(
                            { $or: [{ code: item.productId }, { _id: item.productId }] },
                            { $inc: { stockQuantity: -item.quantity } }
                        )
                        .then(() => {
                            // Poziv funkcije za sledeći artikal u nizu
                            updateStockForItems(itemIndex + 1);
                        })
                        .catch((err) => {
                            res.status(500).json({ message: 'Greška pri ažuriranju zaliha', error: err });
                        });
                    };

                    // Pokretanje umanjenja zaliha od prvog artikla
                    updateStockForItems(0);
                })
                .catch((err) => {
                    res.status(500).json({ message: 'Greška pri kreiranju porudžbine', error: err });
                });
        };

        // Pokretanje procesa obrade od prve grupe (indeks 0)
        saveNextGroup(0);
    }


    // Metoda preuzima listu svih javnih nabavki koje je pokrenuo dati klijent, sortirane po vremenu kreiranja.
    getPublicProcurements = (req: express.Request, res: express.Response): void => {
        const username = req.params.username;

        // Pretraga javnih nabavki za zadatog klijenta
        PublicProcurement.find({ clientUsername: username })
            .sort({ createdAt: -1 })
            .then((procurements) => {
                res.json(procurements);
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju javnih nabavki', error: err }));
    }


    // Metoda pokreće novu javnu nabavku, postavlja tajmer za njeno zatvaranje i naknadnu automatsku evaluaciju ponuda.
    createPublicProcurement = (req: express.Request, res: express.Response): void => {
        const { clientUsername, items, totalAmount } = req.body;

        // Provera da li korpa/lista artikala sadrži stavke
        if (!items || items.length === 0) {
            res.status(400).json({ message: 'Korpa je prazna' });
            return;
        }

        // Definisanje vremena isteka javne nabavke (2 minuta u ovom test primeru)
        const endTime = new Date(Date.now() + 2 * 60 * 1000);

        // Kreiranje novog objekta javne nabavke
        const newProcurement = new PublicProcurement({
            clientUsername,
            items,
            totalBudgetEstimate: totalAmount,
            endTime,
            status: 'otvoreno',
            bids: []
        });

        // Čuvanje javne nabavke u bazi podataka
        newProcurement.save()
            .then((savedProcurement: any) => {
                console.log('Poslat e-mail svim štamparijama za novu javnu nabavku ID:', savedProcurement._id);

                res.status(201).json({ message: 'Javna nabavka je uspešno pokrenuta', procurement: savedProcurement });

                // AUTOMATSKI TAJMER: Izvršava se nakon isteka zadatog vremena
                setTimeout(() => {
                    PublicProcurement.findById(savedProcurement._id)
                        .then((foundProcurement: any) => {
                            if (!foundProcurement || foundProcurement.status !== 'otvoreno') return;

                            // Provera postizanja ponuda
                            if (foundProcurement.bids && foundProcurement.bids.length > 0) {
                                // Sortiranje pristiglih ponuda po ukupnoj ponuđenoj ceni (od najniže ka višoj)
                                const sortedBids = foundProcurement.bids.sort((a: any, b: any) => a.totalOfferPrice - b.totalOfferPrice);

                                // Sekvencijalna evaluacija ponuda štamparija
                                const evaluateBidsSequentially = (bidIndex: number) => {
                                    if (bidIndex >= sortedBids.length) {
                                        // Ako nijedna ponuda ne zadovoljava uslove zaliha
                                        foundProcurement.status = 'isteklo_bez_uslova';
                                        foundProcurement.save().catch((err: any) => console.error('Greška pri statusu isteklo_bez_uslova:', err));
                                        return;
                                    }

                                    const currentBid = sortedBids[bidIndex];

                                    // Provera zaliha za svaki artikal unutar tekuće ponude u magacinu TE ŠTAMPARIJE
                                    const checkItemStockSequentially = (itemIndex: number) => {
                                        if (itemIndex >= foundProcurement.items.length) {
                                            // Svi artikli imaju dovoljno zaliha kod ove štamparije – pronađen je pobednik!
                                            foundProcurement.status = 'zavrseno';
                                            foundProcurement.winningPrinterId = currentBid.printerId;
                                            foundProcurement.winningPrinterName = currentBid.printerName;

                                            // Ažuriranje statusa nabavke u bazi
                                            foundProcurement.save()
                                                .then((savedProc: any) => {
                                                    console.log('Javna nabavka uspešno zatvorena sa statusom zavrseno.');

                                                    // Pronalaženje klijenta da bismo uzeli adresu i grad
                                                    return User.findOne({ username: savedProc.clientUsername })
                                                        .then((client: any) => {
                                                            let clientAddress = client && client.address ? client.address : 'Kumanovska 12, Beograd';
                                                            
                                                            // Parsiranje grada iz adrese
                                                            let parsedCity = 'Beograd';
                                                            if (clientAddress.includes(',')) {
                                                                const parts = clientAddress.split(',');
                                                                parsedCity = parts[parts.length - 1].trim();
                                                            }

                                                            const invoiceId = `FAK-JP-2026-${Date.now()}`;
                                                            const winningOrder = new Order({
                                                                invoiceId: invoiceId,
                                                                clientUsername: savedProc.clientUsername,
                                                                printerId: currentBid.printerId,     
                                                                printerName: currentBid.printerName, 
                                                                items: savedProc.items,                  
                                                                totalAmount: currentBid.totalOfferPrice, 
                                                                status: 'u stampi',
                                                                city: parsedCity,          
                                                                address: clientAddress,    
                                                                createdAt: new Date()
                                                            });

                                                            // Kreiranje pobedničke porudžbine
                                                            return winningOrder.save().then((savedOrder: any) => {
                                                                console.log('USPEH: Kreirana porudžbina u bazi sa ID-jem:', savedOrder._id);

                                                                // Rekurzivno umanjenje zaliha artikala KOD POBEDNIČKE ŠTAMPARIJE
                                                                const reduceStockSequentially = (stockIndex: number) => {
                                                                    if (stockIndex >= savedProc.items.length) {
                                                                        console.log('Zalihe uspešno umanjene kod pobednika.');
                                                                        return;
                                                                    }
                                                                    const item = savedProc.items[stockIndex];

                                                                    Product.findOneAndUpdate(
                                                                        { 
                                                                            printerId: currentBid.printerId, 
                                                                            name: { $regex: `^${item.name}$`, $options: 'i' } 
                                                                        },
                                                                        { $inc: { stockQuantity: -item.quantity } }
                                                                    )
                                                                    .then(() => reduceStockSequentially(stockIndex + 1))
                                                                    .catch((err: any) => {
                                                                        console.error('Greška pri smanjenju zaliha za artikal:', err);
                                                                        reduceStockSequentially(stockIndex + 1);
                                                                    });
                                                                };

                                                                reduceStockSequentially(0);
                                                            });
                                                        });
                                                })
                                                .catch((err: any) => {
                                                    console.error('KRITIČNA GREŠKA pri upisu pobednika ili porudžbine u bazu:', err);
                                                });
                                            return;
                                        }

                                        const item = foundProcurement.items[itemIndex];
                                        Product.findOne({ 
                                            printerId: currentBid.printerId, 
                                            name: { $regex: `^${item.name}$`, $options: 'i' }
                                        })
                                        .then((prod: any) => {
                                            if (prod && prod.stockQuantity >= item.quantity) {
                                                checkItemStockSequentially(itemIndex + 1);
                                            } else {
                                                console.log(`Štampar ${currentBid.printerId} nema dovoljno zaliha za artikal ${item.name}, prelazim na sledećeg ponuđača.`);
                                                evaluateBidsSequentially(bidIndex + 1);
                                            }
                                        })
                                        .catch((err: any) => {
                                            console.error('Greška pri proveri zaliha:', err);
                                            evaluateBidsSequentially(bidIndex + 1);
                                        });
                                    };

                                    // KLJUČNA ISPRAVKA: Pokretanje provere zaliha za prvi artikal tekuće ponude
                                    checkItemStockSequentially(0);

                                };

                                evaluateBidsSequentially(0);

                            } else {
                                foundProcurement.status = 'isteklo_bez_ponuda';
                                foundProcurement.save().catch((err: any) => console.error('Greška pri statusu isteklo_bez_ponuda:', err));
                            }
                        })
                        .catch((err: any) => console.error('Greška pri nalaženju javne nabavke nakon tajmera:', err));
                }, 2 * 60 * 1000); 

            })
            .catch((err: any) => {
                res.status(500).json({ message: 'Greška pri pokretanju javne nabavke', error: err });
            });
    }


    // Metoda preuzima arhivu porudžbina za klijenta (sa statusom 'isporuceno' ili 'primljeno') i obogaćuje ih podacima o proizvodima, lajkovima i komentarima.
    getClientArchive = (req: express.Request, res: express.Response): void => {
        const username = req.params.username;

        // Pretraga završenih porudžbina u bazi
        Order.find({ 
            clientUsername: username, 
            status: { $in: ['isporuceno', 'primljeno'] } 
        })
        .sort({ createdAt: -1 })
        .lean()
        .then((orders: any[]) => {
            if (!orders || orders.length === 0) {
                res.json([]);
                return;
            }

            // Ekstrakcija ID-jeva svih jedinstvenih proizvoda iz istorije porudžbina
            const productIds: string[] = [];
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                if (order && order.items) {
                    for (let j = 0; j < order.items.length; j++) {
                        const item = order.items[j];
                        if (item && item.productId) {
                            const pIdStr = item.productId.toString();
                            if (!productIds.includes(pIdStr)) {
                                productIds.push(pIdStr);
                            }
                        }
                    }
                }
            }

            // Pretraga proizvoda u bazi radi dobijanja njihovih trenutnih ocena i komentara
            Product.find({ $or: [{ productId: { $in: productIds } }, { code: {$in: productIds } }] })
                .lean()
                .then((products: any[]) => {
                    const enrichedOrders = [];

                    // Povezivanje podataka o proizvodima sa stavkama unutar svake porudžbine
                    for (let i = 0; i < orders.length; i++) {
                        const order = orders[i];
                        const updatedItems = [];

                        if (order && order.items) {
                            for (let j = 0; j < order.items.length; j++) {
                                const item = order.items[j];
                                let foundProduct = null;

                                if (item && item.productId) {
                                    const targetId = item.productId.toString();
                                    for (let k = 0; k < products.length; k++) {
                                        const p = products[k];
                                        if (p && (
                                            (p.productId && p.productId.toString() === targetId) ||
                                            (p.code && p.code.toString() === targetId) ||
                                            (p._id && p._id.toString() === targetId)
                                        )) {
                                            foundProduct = p;
                                            break;
                                        }
                                    }
                                }

                                // Dodavanje statistike lajkova, dislajkova i komentara u stavku
                                if (foundProduct) {
                                    updatedItems.push({
                                        ...item,
                                        likesCount: foundProduct.likesCount || 0,
                                        dislikesCount: foundProduct.dislikesCount || 0,
                                        comments: foundProduct.comments || []
                                    });
                                } else {
                                    updatedItems.push({
                                        ...item,
                                        likesCount: 0,
                                        dislikesCount: 0,
                                        comments: []
                                    });
                                }
                            }
                        }

                        enrichedOrders.push({
                            ...order,
                            items: updatedItems
                        });
                    }

                    res.json(enrichedOrders);
                });
        })
        .catch((err) => {
            console.error("GREŠKA U GET CLIENT ARCHIVE:", err);
            res.status(500).json({ message: 'Greška pri preuzimanju arhive', error: err.message });
        });
    }

    // Metoda ažurira status specifične porudžbine iz 'isporuceno' u 'primljeno'.
    markOrderAsReceived = (req: express.Request, res: express.Response): void => {
        const orderId = req.body.orderId;

        // Pronalaženje i ažuriranje statusa porudžbine na 'primljeno'
        Order.findByIdAndUpdate(orderId, { status: 'primljeno' }, { new: true })
            .then((updatedOrder) => {
                if (!updatedOrder) {
                    res.status(404).json({ message: 'Porudžbina nije pronađena' });
                    return;
                }
                res.json({ message: 'Porudžbina je označena kao primljena', order: updatedOrder });
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri ažuriranju statusa porudžbine', error: err }));
    }

    // Metoda obrađuje akcije korisnika nad proizvodom: lajkovanje, dislajkovanje ili dodavanje novog komentara.
    rateOrCommentProduct = (req: express.Request, res: express.Response): void => {
        const { productId, username, action, commentText } = req.body; 

        let updateQuery: any = {};
        // Podešavanje upita u zavisnosti od izabrane akcije korisnika
        if (action === 'like') updateQuery.$inc = { likesCount: 1 };
        if (action === 'dislike') updateQuery.$inc = { dislikesCount: 1 };
        if (action === 'comment' && commentText) {
            updateQuery.$push = {
                comments: {
                    username: username,
                    date: new Date(),
                    text: commentText
                }
            };
        }

        // Formiranje filtera za pretragu proizvoda bez obzira na vrstu identifikatora
        let queryFilter: any = { productId: productId };
        if (productId && productId.length === 24) {
            queryFilter = { $or: [{ productId: productId }, { code: productId }, { _id: productId }] };
        } else {
            queryFilter = { $or: [{ productId: productId }, { code: productId }] };
        }

        // Izvršavanje ažuriranja u bazi podataka
        Product.findOneAndUpdate(queryFilter, updateQuery, { new: true })
            .then((updatedProduct) => {
                if (!updatedProduct) {
                    res.status(404).json({ message: 'Proizvod nije pronađen' });
                    return;
                }
                res.json({ message: 'Uspešno', product: updatedProduct });
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri čuvanju utiska', error: err }));
    }
}