const express = require('express');
const router = express.Router();
const tasksModel = require('../models/tasks');
const projectsModel = require('../models/projects');
const activityModel = require('../models/activity');
const userModel = require('../models/users');
const activity = require('../models/activity');
const prisustvo = require('../models/prisustvo');
const chat = require('../models/chat');


const adminPanel =  async (req, res, next) => {


    const projekti = await projectsModel.find().sort({datumKraja: -1});
    const radnici = await userModel.find();

    async function dobaviPodatke() {
        var projektiStatus = [];
        var sviZadaci = 0;
        var spisakStatusaZadataka = [];
        var zavrseniZadaci = 0;
        var uIzradiZadaci = 0;
        var naCekanjuZadaci = 0;
        await Promise.all(projekti.map(async (projekat) => {
            const zadaci = await tasksModel.find({ projekat: projekat.id });
            var uradjeniZadaci = 0;
    
            zadaci.forEach((zadatak) => {
                if (zadatak.status == "zavrsen") {
                    uradjeniZadaci++;
                    zavrseniZadaci++;
                }
                else if (zadatak.status == "izrada") {
                    uIzradiZadaci++;
                }
                else {
                    naCekanjuZadaci++;
                }
            });
            const cistiProjekat = projekat.toObject();
            sviZadaci += zadaci.length;
            projektiStatus.push({
                sviZadaci: sviZadaci,
                sviProjekti: projekti.length,
                uradjeniZadaci: uradjeniZadaci,
                sviRadnici: radnici.length,
                brojZadataka: zadaci.length,
                projekat:{...cistiProjekat}
            });
        }));
        spisakStatusaZadataka.push({
            zavrseniZadaci: zavrseniZadaci,
            uIzradiZadaci: uIzradiZadaci,
            naCekanjuZadaci: naCekanjuZadaci
        })
        const rezultat = {projektiStatus, spisakStatusaZadataka};
        return rezultat
    }
    const zadaciRadnik = await tasksModel.find().populate({path: 'projekat',select: 'radnici menadzer nazivProjekta'});
    const rezultat = await dobaviPodatke();

    const rezultatSaRadnimSatima = [];
    async function rezultatSaRadnicima() {
        const aktivnosti = await activityModel.find();
        radnici.map((radnik) => {
            let radniSati = 0;
            aktivnosti.map((aktivnost) => {
                if (aktivnost.radnikId === radnik._id.toString() ){
                    var razlika = aktivnost.vrijemeKraja - aktivnost.vrijemePocetka;
                    radniSati += razlika / (1000 * 60 * 60);
                }
            })
            rezultatSaRadnimSatima.push({ime: radnik.ime, prezime: radnik.prezime, radniSati:radniSati})
        })
        return rezultatSaRadnimSatima
    }

    const najaktivnijiRadnici = await rezultatSaRadnicima();
    najaktivnijiRadnici.sort((a, b) => a.radniSati - b.radniSati);
    najaktivnijiRadnici.reverse();
    res.render('admin/admin', {admin: req.session.admin,zadaci:zadaciRadnik, najaktivniji: najaktivnijiRadnici, projekti: rezultat.projektiStatus, spisakZadataka: rezultat.spisakStatusaZadataka});

}



const izvjestaj = async (req, res, next) => {
    const projekti = await projectsModel.find();

    async function dobaviPodatke() {
        var projektiStatus = [];
        await Promise.all(projekti.map(async (projekat) => {
            var zavrseniZadaci = 0;
            var sviZadaci = 0;
            var radniSati = 0;
            const zadaci = await tasksModel.find({ projekat: projekat.id });
            const aktivnosti = await activityModel.find({projekat: projekat.id});
    
            await Promise.all(zadaci.map(async (zadatak) => {
                if (zadatak.status == "zavrsen") {
                    zavrseniZadaci++;
                    sviZadaci++;
                } else {
                    sviZadaci++;
                }
            }));
            aktivnosti.forEach((aktivnost) => {
                var razlika = aktivnost.vrijemeKraja - aktivnost.vrijemePocetka;
                radniSati += razlika / (1000 * 60 * 60);
            });

            const cistiProjekat = projekat.toObject();
            projektiStatus.push({
                uradjeniZadaci: zavrseniZadaci,
                brojZadataka: sviZadaci,
                radniSati: Math.round(radniSati),
                projekat:{...cistiProjekat}
            });
        }));
        return projektiStatus
    }

    const rezultat = await dobaviPodatke();
    const radnici = await userModel.find();

    let spisakSve = []
    async function dobaviPodatkeSaRadnicima (){
        const aktivnosti = await activityModel.find()
        radnici.map((radnik) => {
            let brojRadnihSati = 0;
            let brojProjekata = 0;
            projekti.map((projekat) => {
                if (projekat.radnici.includes(radnik.username) || projekat.menadzer === radnik.username) {
                    brojProjekata++
                }
            })

        aktivnosti.map((aktivnost) => {
            if(aktivnost.radnikId === radnik._id.toString()){
                var razlika = aktivnost.vrijemeKraja - aktivnost.vrijemePocetka;
                brojRadnihSati += razlika / (1000 * 60 * 60);
            }
        })
        spisakSve.push({brojProjekata, brojRadnihSati, ime: radnik.ime, prezime: radnik.prezime, pozicija:radnik.pravilo})
        })
        return spisakSve
    }
    const rezultatSaRadnicima = await dobaviPodatkeSaRadnicima()
    res.render('admin/reports', {admin: req.session.admin, izvjestaj: rezultat, izvjestajSaRadnicima: rezultatSaRadnicima});
}






module.exports = {izvjestaj, adminPanel};
