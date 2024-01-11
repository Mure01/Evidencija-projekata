const express = require('express');
const router = express.Router();
const tasksModel = require('../models/tasks');
const projectModel = require('../models/projects')
const userModel = require('../models/users')


const listaZadatakaAdmin = async (req, res, next) => {

    const zadaci = await tasksModel.find().populate('projekat','nazivProjekta');
    const radnikId = req.session.userId;
    const radnik = await userModel.find({_id : radnikId});

    const projekat = await projectModel.find();
    res.render('admin/tasks', {zadaci: zadaci, projekat: projekat, admin: req.session.admin, radnik: radnik, radnikId: radnikId});

};

const listaZadatakaRadnik = async (req, res, next) => {

    const zadaci = await tasksModel.find().populate({path: 'projekat',select: 'radnici menadzer nazivProjekta'});
    const radnikId = req.session.userId;
    const radnik = await userModel.find({_id : radnikId});
    const radnikUsername = req.session.username;
    var zadaciRadnik = [];
    zadaci.map((zadatak) => {
        if(zadatak.projekat.radnici.includes(radnikUsername) || zadatak.projekat.menadzer === radnikUsername){
            zadaciRadnik.push(zadatak);
        }
    })

    const projekat = await projectModel.find();
    res.render('admin/tasks', {zadaci: zadaciRadnik, projekat: projekat, admin: req.session.admin, manager: req.session.manager, radnik: radnik, radnikId: radnikId});

};


const dodajZadatak = async (req, res, next) => {
    const {projekatId, nazivZadatka, pocetniDatum, zavrsniDatum, status, opisZadatka} = req.body;
    
    const task = new tasksModel({
        nazivZadatka: nazivZadatka,
        projekat: projekatId,
        opisZadatka: opisZadatka,
        datumKraja: zavrsniDatum,
        datumPocetka: pocetniDatum,
        status: status,
    })
    await task.save();
    
    res.redirect('/listTasks');
}

const azurirajZadatak = async (req, res, next) => {
    const {projekatId, nazivZadatka, pocetniDatum, zavrsniDatum, status, opisZadatka} = req.body;
    const id = req.params.id;

    await tasksModel.findByIdAndUpdate(id, {
        nazivZadatka: nazivZadatka,
        projekat: projekatId,
        opisZadatka: opisZadatka,
        datumKraja: zavrsniDatum,
        datumPocetka: pocetniDatum,
        status: status,
    })

    res.redirect('/projectDetails/'+projekatId);
}


module.exports = {listaZadatakaAdmin, listaZadatakaRadnik, dodajZadatak, azurirajZadatak};