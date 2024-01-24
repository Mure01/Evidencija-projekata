const express = require('express');
const router = express.Router();
const userModel = require('../models/users');
const prisustvoModel = require('../models/prisustvo')
const kript = require('bcryptjs')
const fs = require('fs');
const puppeteer = require('puppeteer');

const {transporter} = require('../config');


const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next();
    }else {
        res.redirect('/')
    }
  }
  const isAdmin = (req, res, next) => {
    if(req.session.admin){
        next();
    }else {
        res.redirect('/users')
    }
  }

router.post('/dodajRadnika', isAdmin, isAuth, async (req, res, next) => {
    const {ime, prezime, pravilo, email, username, password, passworddva} = req.body;

    if(password !== passworddva){
        return res.status(400).send("Lozinke se ne podudaraju");
     }

     const salt = kript.genSaltSync();
     const savepass = kript.hashSync(password, salt);

    var admin = false;

    if(pravilo == "Admin") {
         admin = true 
    }else {
        admin = false;
    }
    const newuser = new userModel(
        {ime: ime,
        prezime: prezime, 
        pravilo: pravilo, 
        email: email,
        username: username,
        password: savepass,
        administrator: admin
    }
    );
    await newuser.save();

    res.redirect('/admin');
})

router.get('/listaRadnika',  isAdmin, isAuth, async (req, res, next) => {

    const radnici = await userModel.find();

    res.render('admin/listusers', {radnici: radnici ,admin: req.session.admin});

})

router.post('/obrisiRadnika/:id', isAdmin, isAuth, async (req, res, next) => {
    const idRadnika = req.params.id;
    await userModel.findByIdAndDelete(idRadnika);  
    res.redirect('/listaRadnika');
});

router.get('/radnoVrijemeRadnika/:id', isAdmin, isAuth, async (req,res,next) => {

    const idTrazenog = req.params.id;
    const radnik = await userModel.findById(idTrazenog)
    const pocetniDanMjeseca = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const zadnjiDanMjeseca = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

const radnoVrijeme = await prisustvoModel.find({
  vrijemeDolaska: {
    $gte: pocetniDanMjeseca,
    $lte: zadnjiDanMjeseca
  }
});
    var radniciRadnoVrijeme = [];
        radnoVrijeme.map((radniDan) => {
            if(idTrazenog == radniDan.radnikId.toString()) {
                const razlikaMs = radniDan.vrijemeOdlaska - radniDan.vrijemeDolaska;
                const razlikaSati = Math.floor(razlikaMs / (1000 * 60 * 60));
                const razlikaMinuti = Math.floor((razlikaMs % (1000 * 60 * 60)) / (1000 * 60));
                radniciRadnoVrijeme.push({radnikID: radnik._id, ime:radnik.ime, prezime:radnik.prezime, datumPrisustva: radniDan.vrijemeDolaska, radniSati:razlikaSati, radneMinute: razlikaMinuti});
            }
        })
        if(radniciRadnoVrijeme.length < 1) {
            radniciRadnoVrijeme.push({ime: radnik.ime, prezime:radnik.prezime, datumPrisustva: 0})
        }
    res.render('admin/userworktime', {admin:req.session.admin, izvjestaj: radniciRadnoVrijeme})

})




router.post('/slanjeIzvjestajaAdminu', isAuth, async (req, res, next) => {
        const tableHtml = req.body.tabelaHtml;
        const cssTabele = req.body.cssTabele;
        async function createPdf() {
            const browser = await puppeteer.launch({ headless: "new" });

            htmlContent = `
            <html>
            <head>
            <style>
            ${cssTabele}
            </style>
            </head>
            <body>
            ${tableHtml}
            </body>
            </html>
            `
            const page = await browser.newPage();
            await page.setContent( htmlContent ,{ waitUntil: "domcontentloaded"});
            await page.pdf({path: 'izvjestaj.pdf', format: 'A4'}); // kreiranje PDF-a
          
            await browser.close();
          }
          
          await createPdf();
          const mailOptions = {
            from: 'belci911mu@gmail.com',
            to: 'belci911mu@gmail.com',
            subject: 'Testna email poruka',
            text: 'Vas izvestaj u PDF formatu je prilozen.',
            attachments: [
                { 
                    filename: 'izvestaj.pdf',
                    path: 'izvjestaj.pdf',
                    encoding: 'base64',
                    contentType: 'application/pdf'
                }
            ]
        };

        transporter.sendMail(mailOptions, (err, results) => {
            if(err) {
                console.log(err)
            }else {
                console.log("Poslali ste mail uspjesno")
                res.sendStatus(200).send("Uspjesno poslan mail")
            }
        })

});




module.exports = router;