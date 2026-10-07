import express from 'express';
import Category from '../models/category';

export class CategoryController {

    // Dohvatanje svih kategorija sa potkategorijama
    getCategories = (req: express.Request, res: express.Response): void => {
        // Metoda pronalazi i vraća kompletnu listu svih kategorija iz baze podataka u JSON formatu.
        Category.find({})
            .then((categories) => res.status(200).json(categories))
            .catch((err) => res.status(500).json({ message: 'Greška prilikom pretrage kategorija', error: err }));
    }

    // Dodavanje nove glavne kategorije
    addCategory = (req: express.Request, res: express.Response): void => {
        let { name } = req.body;
        let newCategory = new Category({ name, subcategories: [] });

        // Metoda kreira i upisuje novu glavnu kategoriju sa praznim nizom potkategorija u bazu podataka.
        newCategory.save()
            .then(() => res.status(201).json({ message: 'Kategorija je uspešno dodata' }))
            .catch((err) => res.status(500).json({ message: 'Greška prilikom dodavanja kategorije', error: err }));
    }

    // Dodavanje potkategorije u izabranu kategoriju
    addSubcategory = (req: express.Request, res: express.Response): void => {
        let { categoryName, subcategoryName } = req.body;

        // Metoda pronalazi postojeću kategoriju po nazivu i ubacuje novu potkategoriju u njen niz.
        Category.updateOne(
            { name: categoryName },
            { $push: { subcategories: { name: subcategoryName } } }
        )
        .then((result) => {
            if (result.modifiedCount > 0) {
                res.status(200).json({ message: 'Potkategorija je uspešno dodata' });
            } else {
                res.status(404).json({ message: 'Kategorija nije pronađena' });
            }
        })
        .catch((err) => res.status(500).json({ message: 'Greška prilikom dodavanja potkategorije', error: err }));
    }
}