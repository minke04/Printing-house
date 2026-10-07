import express from 'express';
import Product from '../models/product';
import User from '../models/user';

export class PublicController {

    // Prebrojava i vraća ukupan broj odobrenih štamparija u bazi podataka.
    getTotalPrinters = (req: express.Request, res: express.Response): void => {
        // Pretraga korisnika sa ulogom štampara i statusom odobrenja
        User.countDocuments({role: 'stampar', status: 'approved'})
        .then((count) => {
            res.json({totalPrinters: count});
        })
        .catch((err) => {
            res.status(500).json({message: 'Greška pri brojanju štampača', error: err});
        });
    }

    // Pronalazi i vraća 5 najbolje ocenjenih proizvoda čije su štamparije odobrene.
    getTopProducts = (req: express.Request, res: express.Response): void => {
        Product.aggregate([
        {
            // Povezivanje proizvoda sa korisnicima preko printerId-ja
            $lookup: {
            from: 'users',            // Naziv kolekcije korisnika u bazi
            localField: 'printerId',  // Polje u proizvodu
            foreignField: 'username', // Polje u korisnicima
            as: 'printerInfo'
            }
        },
        // Raspakivanje niza printerInfo u objekat
        { $unwind: '$printerInfo' },
        {
            // Filtriranje proizvoda čija je štamparija odobrena i ima ulogu štampara
            $match: {
            'printerInfo.status': 'approved',
            'printerInfo.role': 'stampar'
            }
        },
        // Sortiranje po broju lajkova opadajuće i ograničavanje na 5 rezultata
        { $sort: { likesCount: -1 } },
        { $limit: 5 },
        // Uklanjanje privremenog polja sa podacima o štampariji iz rezultata
        {
            $project: {
            printerInfo: 0
            }
        }
        ])
        .then((products) => {
            res.json(products);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri preuzimanju najboljih proizvoda', error: err });
        });
    }

    // Vraća listu svih aktivnih kategorija proizvoda koji imaju zalihe i pripadaju odobrenim štamparijama.
    getActiveCategories = (req: express.Request, res: express.Response): void => {
        Product.aggregate([
        // Filtriranje proizvoda koji imaju zalihe veće od nule
        { $match: { stockQuantity: { $gt: 0 } } },
        {
            // Povezivanje sa kolekcijom korisnika radi provere štamparije
            $lookup: {
            from: 'users',
            localField: 'printerId',
            foreignField: 'username',
            as: 'printerInfo'
            }
        },
        { $unwind: '$printerInfo' },
        // Filtriranje prema odobrenom statusu i ulozi štampara
        {
            $match: {
            'printerInfo.status': 'approved',
            'printerInfo.role': 'stampar'
            }
        },
        // Grupisanje po kategoriji i sortiranje po nazivu
        { $group: { _id: '$category' } },
        { $sort: { _id: 1 } }
        ])
        .then((categories) => {
            // Mapiranje rezultata u niz naziva kategorija
            const categoryNames = categories.map(c => c._id);
            res.json(categoryNames);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri preuzimanju aktivnih kategorija', error: err });
        });
    }

    // Pretražuje proizvode na osnovu zadatog naziva, kategorije i stanja zaliha kod odobrenih štamparija.
    searchProducts = (req: express.Request, res: express.Response): void => {
        const nameQuery = req.query.name as string || '';
        const categoryQuery = req.query.category as string || 'All';

        // Inicijalizacija uslova pretrage sa minimalnim uslovom zaliha
        let matchCondition: any = { stockQuantity: { $gt: 0 } };

        // Dodavanje uslova za naziv ako je unet
        if (nameQuery.trim() !== '') {
        matchCondition.name = { $regex: nameQuery, $options: 'i' };
        }

        // Dodavanje uslova za kategoriju ako nije izabrana opcija za sve
        if (categoryQuery !== 'All' && categoryQuery !== 'Sve kategorije') {
        matchCondition.category = categoryQuery;
        }

        Product.aggregate([
        // Primena formiranih uslova pretrage
        { $match: matchCondition },
        {
            // Povezivanje sa podacima o štampariji
            $lookup: {
            from: 'users',
            localField: 'printerId',
            foreignField: 'username',
            as: 'printerInfo'
            }
        },
        { $unwind: '$printerInfo' },
        // Provera da li je štamparija odobrena
        {
            $match: {
            'printerInfo.status': 'approved',
            'printerInfo.role': 'stampar'
            }
        },
        // Uklanjanje informacija o štampariji iz izlaznih podataka
        {
            $project: {
            printerInfo: 0 
            }
        }
        ])
        .then((products) => {
            res.json(products);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri pretrazi proizvoda', error: err });
        });
    }

    // Pronalazi i vraća detaljne informacije o specifičnom proizvodu na osnovu prosleđenog ID-ja ili koda.
    getProductDetails = (req: express.Request, res: express.Response): void => {
        let productId = req.params.id as string;

        // Provera da li je prosleđeni parametar validan MongoDB ObjectId ili običan kod proizvoda
        let query = productId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: productId } 
            : { code: productId };

        // Pretraga jedinstvenog proizvoda u bazi
        Product.findOne(query)
            .then((product) => {
                if (!product) {
                    res.status(404).json({ message: 'Proizvod nije pronadjen.' });
                    return;
                }
                res.json(product);
            })
            .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju detalja o proizvodu', error: err }));
    }
}