import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/user';

// Uspostavljanje konekcije sa MongoDB bazom podataka za potrebe seed-ovanja
mongoose.connect('mongodb://localhost:27017/printing_house')
  .then(() => {
    console.log('Connected to DB for seeding...');

    // Brisanje svih postojećih dokumenata u kolekciji korisnika pre ubacivanja novih podataka
    User.deleteMany({})
      .then(() => {
        // Generisanje bezbednosnog salc-a (salt) za bcrypt heširanje lozinki
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.error(err);
            process.exit(1);
          }

          // Definišemo niz početnih korisnika sa njihovim jedinstvenim čistim lozinkama i atributima
          const rawUsers = [
            { username: "admin", rawPass: "Admin123!", email: "admin@printing.rs", role: "admin", status: "approved", name: "Glavni", surname: "Administrator", phone: "0601111111", profileImage: "default_profile_image.jpg" },
            { username: "stampar1", rawPass: "Stampar1!", email: "office@copystudio.rs", role: "stampar", status: "approved", name: "Marko", surname: "Marković", phone: "062222222", institutionName: "Copy Studio Kumanovska", address: "Kumanovska 12, Beograd", registrationNumber: "12345678", taxId: "100200300", profileImage: "default_profile_image.jpg" },
            { username: "stampar2", rawPass: "Stampar2!", email: "info@printmaster.rs", role: "stampar", status: "approved", name: "Stefan", surname: "Stefanović", phone: "063333333", institutionName: "Print Master Plus", address: "Bulevar Kralja Aleksandra 45, Beograd", registrationNumber: "87654321", taxId: "109876543", profileImage: "default_profile_image.jpg" },
            { username: "stampar3", rawPass: "Stampar3!", email: "kontakt@megaprint.rs", role: "stampar", status: "pending", name: "Nikola", surname: "Nikolić", phone: "063444555", institutionName: "Mega Print DOO", address: "Tošin Bunar 140, Beograd", registrationNumber: "55667788", taxId: "104433221", profileImage: "default_profile_image.jpg" },
            { username: "firma_skola", rawPass: "Firma123!", email: "kontakt@skola.edu.rs", role: "pravno_lice", status: "approved", name: "Jovan", surname: "Jovanović", phone: "064444444", institutionName: "Elektrotehnička škola Nikola Tesla", address: "Kraljice Marije 73, Beograd", registrationNumber: "11223344", taxId: "105566778", profileImage: "default_profile_image.jpg" },
            { username: "firma_nova", rawPass: "Firma456!", email: "office@novafirma.rs", role: "pravno_lice", status: "pending", name: "Ana", surname: "Anić", phone: "065555555", institutionName: "Nova Firma DOO", address: "Nemanjina 4, Beograd", registrationNumber: "44332211", taxId: "108899001", profileImage: "default_profile_image.jpg" },
            { username: "firma_kg", rawPass: "Firma789!", email: "office@univerzitetkg.rs", role: "pravno_lice", status: "approved", name: "Milica", surname: "Milić", phone: "065888999", institutionName: "Univerzitet u Kragujevcu", address: "Jovana Cvijića bb, Kragujevac", registrationNumber: "99887766", taxId: "107766554", profileImage: "default_profile_image.jpg" },
            { username: "pera_peric", rawPass: "Pera123!", email: "pera@gmail.com", role: "fizicko_lice", status: "approved", name: "Petar", surname: "Perić", phone: "066666666", profileImage: "default_profile_image.jpg" },
            { username: "mika_mikic", rawPass: "Mika123!", email: "mika@gmail.com", role: "fizicko_lice", status: "approved", name: "Miodrag", surname: "Mikić", phone: "067777777", profileImage: "default_profile_image.jpg" },
            { username: "zika_zikic", rawPass: "Zika123!", email: "zika@gmail.com", role: "fizicko_lice", status: "approved", name: "Živojin", surname: "Žikić", phone: "068888888", profileImage: "default_profile_image.jpg" }
        ];

          // Asinhrono mapiranje svakog korisnika radi generisanja bezbednog heša za njegovu lozinku
          Promise.all(
            rawUsers.map((user) => {
              return new Promise((resolve, reject) => {
                bcrypt.hash(user.rawPass, salt!, (hashErr, hashedPassword) => {
                  if (hashErr) {
                    reject(hashErr);
                  } else {
                    // Vraćamo kompletiran objekat spreman za bazu, zamenjujući čistu lozinku heširanom vrednošću
                    resolve({
                      username: user.username,
                      password: hashedPassword,
                      email: user.email,
                      role: user.role,
                      status: user.status,
                      name: user.name,
                      surname: user.surname,
                      phone: user.phone,
                      profileImage: user.profileImage,
                      institutionName: (user as any).institutionName,
                      address: (user as any).address,
                      registrationNumber: (user as any).registrationNumber,
                      taxId: (user as any).taxId
                    });
                  }
                });
              });
            })
          )
            .then((hashedUsers: any) => {
              // Masovno ubacivanje pripremljenih i bezbednih korisnika u bazu podataka
              User.insertMany(hashedUsers)
                .then(() => {
                  console.log('Database successfully seeded with unique encrypted passwords!');
                  process.exit(0);
                })
                .catch((insertErr) => {
                  console.error('Error inserting users:', insertErr);
                  process.exit(1);
                });
            })
            .catch((hashErr) => {
              console.error('Error hashing passwords:', hashErr);
              process.exit(1);
            });
        });
      })
      .catch((deleteErr) => {
        console.error('Error clearing collection:', deleteErr);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error('Seeding connection error:', err);
    process.exit(1);
  });