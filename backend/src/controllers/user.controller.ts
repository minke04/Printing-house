import express from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$\%^&*(),.?":{}\vert{}<>]{8,12}$/;

export class UserController {
    
    // Obavlja prijavljivanje korisnika na sistem uz proveru statusa naloga i validaciju heširane lozinke.
    login = (req: express.Request, res: express.Response): void => {
        let username = req.body.username;
        let password = req.body.password;

        // Pronalaženje korisnika po korisničkom imenu
        User.findOne({ username: username })
        .then((user: any) => {
            // Provera da li korisnik postoji i da li je administrator (admin se ne prijavljuje ovde)
            if (!user || user.role === 'admin') {
                res.status(400).json({ message: 'Nevažeće korisničko ime ili lozinka' });
                return;
            }
            // Provera da li je administrator odobrio nalog
            if (user.status !== 'approved') {
                res.status(403).json({ message: 'Nalog još uvek nije odobrio administrator.' });
                return;
            }

            // Poređenje unete lozinke sa heširanom lozinkom iz baze
            bcrypt.compare(password, user.password).then((isMatch: any) => {
                if (!isMatch) {
                    res.status(400).json({ message: 'Nevažeće korisničko ime ili lozinka' });
                } else {
                    // Pretvaranje Mongoose objekta u običan JS objekat da bi se uklonila lozinka
                    let userObj = user.toObject();
                    delete userObj.password; // Uklanjanje lozinke iz bezbednosnih razloga pre slanja na frontend

                    // Vraćanje poruke o uspešnoj prijavi i svih ostalih podataka o korisniku
                    res.json({
                        message: 'Prijava uspešna',
                        ...userObj // Raspakivanje ostalih osobenosti korisnika iz baze
                    });
                }
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška servera', error: err });
        });
    }

    // Omogućava posebnu i sigurnu prijavu isključivo za administratore sistema.
    adminLogin = (req: express.Request, res: express.Response): void => {
        let username = req.body.username;
        let password = req.body.password;

        // Pretraga korisnika sa zadatim korisničkim imenom i ulogom admina
        User.findOne({ username: username, role: 'admin' })
        .then((user: any) => {
            if (!user) {
                res.status(400).json({ message: 'Neovlašćeni pristup' });
                return;
            }

            // Upoređivanje unete i sačuvane administratorske lozinke
            bcrypt.compare(password, user.password).then((isMatch: any) => {
                if (!isMatch) {
                    res.status(400).json({ message: 'Nevažeća administratorska lozinka' });
                } else {
                    res.json({ message: 'Prijava administratora uspešna', role: 'admin' });
                }
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška servera', error: err });
        });
    }

    // Vršе registraciju novog korisnika uz validaciju lozinke, poslovnih podataka i heširanje.
    register = (req: express.Request, res: express.Response): void => {

        // Svi tekstualni podaci su i dalje u req.body
        let { username, password, email, role, name, surname, phone, institutionName, address, registrationNumber, taxId } = req.body;

        // FIZIČKI FAJL JE SADA OVDE: Ako je poslat fajl, uzmi njegovo novo ime, u suprotnom stavi podrazumevanu sliku
        let profileImage = req.file ? req.file.filename : 'default_profile_image.jpg';

        // Provera da li lozinka zadovoljava definisane bezbednosne kriterijume
        if (!passwordRegex.test(password)) {
            res.status(400).json({ message: 'Lozinka ne ispunjava bezbednosne kriterijume (8-12 karaktera, počinje slovom, sadrži velika slova, broj i posebne karaktere).' });
            return;
        }

        // Validacija matičnog broja i PIB-a ukoliko je u pitanju pravno lice ili štamparija
        if (role === 'pravno_lice' || role === 'stampar') {
            if (!registrationNumber || !/^\d{8}$/.test(registrationNumber)) {
                res.status(400).json({ message: 'Registracioni broj mora imati tačno 8 cifara.' });
                return;
            }
            if (!taxId || !/^[1-9]\d{8}$/.test(taxId)) {
                res.status(400).json({ message: 'Tax ID mora imati 9 cifara i ne sme početi sa 0.' });
                return;
            }
        }

        // Provera da li već postoji korisnik sa istim korisničkim imenom ili email adresom
        User.findOne({ $or: [{ username: username }, { email: email }] })
        .then((existing) => {
            if (existing) {
                res.status(400).json({ message: 'Korisničko ime ili imejl već postoje.' });
                return;
            }

            // Generisanje sola i heširanje lozinke pre upisa u bazu
            bcrypt.genSalt(10, (err: any, salt: any) => {
                bcrypt.hash(password, salt, (err: any, hashed: any) => {
                    // Ako slika nije prosleđena, postavlja se prazan string (frontend prikazuje podrazumevanu sliku)
                    let finalProfileImage = profileImage || '';
                    // Fizička lica se automatski odobravaju, dok pravna lica i štampari čekaju odobrenje
                    let accountStatus = (role === 'fizicko_lice') ? 'approved' : 'pending';

                    // Kreiranje nove instance korisničkog modela
                    let userData: any = {
                        username: username,
                        password: hashed,
                        email: email,
                        role: role,
                        status: accountStatus,
                        name: name,
                        surname: surname,
                        phone: phone,
                        profileImage: finalProfileImage
                    };

                    // Dodatna polja se dodaju SAMO ako je u pitanju pravno lice ili štampar
                    if (role === 'pravno_lice' || role === 'stampar') {
                        userData.institutionName = institutionName;
                        userData.address = address;
                        userData.registrationNumber = registrationNumber;
                        userData.taxId = taxId;
                    }

                    // Kreiranje nove instance korisničkog modela
                    let newUser = new User(userData);

                    // Čuvanje novog korisnika u bazi podataka
                    newUser.save()
                    .then(() => {
                        res.json({ message: 'Zahtev za registraciju je uspešno kreiran', status: accountStatus });
                    })
                    .catch((saveErr) => {
                        res.status(500).json({ message: 'Greška pri čuvanju u bazu podataka', error: saveErr });
                    });
                });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška servera', error: err });
        });
    }

    // Inicira proces resetovanja lozinke generisanjem unikatnog tokena i definisanjem roka važenja.
    forgotPassword = (req: express.Request, res: express.Response): void => {
        let input = req.body.input;

        // Pronalaženje korisnika preko korisničkog imena ili email adrese
        User.findOne({ $or: [{ username: input }, { email: input }] })
        .then((user: any) => {
            if (!user) {
                res.status(404).json({ message: 'Korisnik nije pronadjen.' });
                return;
            }

            // Generisanje bezbednog nasumičnog tokena i definisanje roka trajanja od 5 minuta
            let token = crypto.randomBytes(32).toString('hex');
            user.resetToken = token;
            user.resetTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minuta

            // Snimanje tokena u bazu i slanje linka za resetovanje
            user.save()
            .then(() => {
                let resetLink = `http://localhost:4200/reset-password/${token}`;
                res.json({ message: 'Link za resetovanje je poslat', resetLink: resetLink });
            })
            .catch((saveErr: any) => {
                res.status(500).json({ message: 'Greška servera', error: saveErr });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška servera', error: err });
        });
    }

    // Proverava validnost tokena za resetovanje i upisuje novu heširanu lozinku korisnika.
    resetPassword = (req: express.Request, res: express.Response): void => {
        let token = req.params.token;
        let newPassword = req.body.newPassword;

        // Pronalaženje korisnika po važećem tokenu čiji rok još uvek nije istekao
        User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } })
        .then((user: any) => {
            if (!user) {
                res.status(400).json({ message: 'Link je nevažeći ili je istekao (rok od 5 minuta).' });
                return;
            }

            // Validacija nove lozinke prema bezbednosnim pravilima
            if (!passwordRegex.test(newPassword)) {
                res.status(400).json({ message: 'Nova lozinka ne ispunjava zahteve.' });
                return;
            }

            // Heširanje nove lozinke i brisanje iskorišćenog tokena
            bcrypt.genSalt(10, (err:any, salt:any) => {
                bcrypt.hash(newPassword, salt, (err: any, hashed: any) => {
                    user.password = hashed;
                    user.resetToken = undefined;
                    user.resetTokenExpires = undefined;

                    user.save()
                    .then(() => {
                        res.json({ message: 'Lozinka je uspešno promenjena.' });
                    })
                    .catch((saveErr:any) => {
                        res.status(500).json({ message: 'Greška servera', error: saveErr });
                    });
                });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška servera', error: err });
        });
    }

    // Vraća listu svih korisnika čiji nalozi čekaju odobrenje administratora.
    getPendingUsers = (req: express.Request, res: express.Response): void => {
        User.find({ status: 'pending' })
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri preuzimanju korisnika na čekanju', error: err });
        });
    }

    // Odobrava korisnički nalog menjajući njegov status u bazi na odobreno.
    approveUser = (req: express.Request, res: express.Response): void => {
        let username = req.body.username; 
        User.updateOne({ username: username }, { $set: { status: 'approved' } })
        .then(() => {
            res.json({ message: 'Korisnik je uspešno odobren.' });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri odobravanju korisnika', error: err });
        });
    }

    // Odbija zahtev za registraciju i trajno briše korisnika iz sistema.
    rejectUser = (req: express.Request, res: express.Response): void => {
        let username = req.body.username;
        User.deleteOne({ username: username })
        .then(() => {
            res.json({ message: 'Zahtev korisnika je odbijen i obrisan.' });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Greška pri odbijanju korisnika', error: err });
        });
    }

    // Preuzima i vraća listu apsolutno svih registrovanih korisnika u sistemu.
    getAllUsers = (req: express.Request, res: express.Response): void => {
        User.find({})
        .then((users) => res.json(users))
        .catch((err) => res.status(500).json({ message: 'Greška pri preuzimanju korisnika', error: err }));
    }

    // Omogućava administratoru direktnu izmenu podataka postojećeg korisnika.
    updateUserByAdmin = (req: express.Request, res: express.Response): void => {
        let { username, name, surname, email, phone, role, institutionName, address, taxId } = req.body;
        User.updateOne(
            { username: username },
            { 
                $set: { 
                    name, surname, email, phone, role, institutionName, address, taxId 
                } 
            }
        )
        .then(() => res.json({ message: 'Korisnik je uspešno ažuriran.' }))
        .catch((err) => res.status(500).json({ message: 'Greška pri ažuriranju korisnika', error: err }));
    }

    // Briše korisnika sa sistema uz zaštitu od slučajnog ili namernog brisanja administratorskog naloga.
    deleteUserByAdmin = (req: express.Request, res: express.Response): void => {
        let username = req.body.username;
        
        // Provera da li nalog koji se brisa pripada administratoru
        User.findOne({ username: username }).then((user) => {
            if (user && user.role === 'admin') {
                res.json({ message: 'Ne možete izbrisati administratorski nalog!' });
                return;
            }

            // Brisanje korisnika ukoliko nije administrator
            User.deleteOne({ username: username })
                .then(() => res.json({ message: 'Korisnik je uspešno obrisan.' }))
                .catch((err) => res.status(500).json({ message: 'Greška pri brisanju korisnika', error: err }));
        });
    }
}