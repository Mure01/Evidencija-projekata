const express = require('express');
const router = express.Router();
const projectsModel = require('../models/projects');
const userModel = require('../models/users');
const tasksModel = require('../models/tasks');
const activityModel = require('../models/activity');
const mongoose = require('../config');
const {transporter} = require('../config');
const users = require('../models/users');


const dodajProjekatAdmin = async (req, res, next) => {

    const {nazivProjekta, pocetniDatum, menadzer, status, datumIsteka, radnici, opis} = req.body;
    const newProject = new projectsModel(
        {
            nazivProjekta: nazivProjekta,
            datumPocetka: pocetniDatum, 
            menadzer: menadzer,
            status: status,
            datumKraja: datumIsteka,
            radnici: radnici,
            opis: opis
        }
    )
    await newProject.save();
      
    const mailovi = await users.find({ $or: [{ username: { $in: radnici } }, { username: menadzer }] },   { _id: 0, email: 1 } )
    var poslatiMailove = ["belci911mu@gmail.com"]

    mailovi.map((mail) => {
      poslatiMailove.push(mail.email)
    })
    const mailOptions = {
      from: 'belci911mu@gmail.com',
      to: poslatiMailove,
      subject: 'Testna email poruka',
      text: 'Ovo je testna email poruka poslata pomoću Nodemailer biblioteke.',
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
      if(err) {
        console.log(err)
      }
      console.log("Email poslan")
    })

    res.redirect('/listaProjekata');
}

const listaProjekataAdmin = async (req, res, next) => {
  const projekti = await performLookup();
  res.render('admin/listprojects', { projekti: projekti, admin: req.session.admin})
  
}

const listaProjekataRadnik = async (req, res, next) => {
  const projekti = await performLookup();
  const username = req.session.username;
  var spisakRadnikovihProjekata = [];

  projekti?.map((projekat) => {
    if(projekat.radnici.includes(username) || projekat.menadzer === username){
      spisakRadnikovihProjekata.push(projekat)
    }
  })
  
  res.render('admin/listprojects', { projekti: spisakRadnikovihProjekata, admin: req.session.admin})
  
}


const urediProjekatAdmin = async (req, res, next) => {

    const id = req.params.id;
    const projekti = await performLookup();
    var projekatSve = {};
    projekti.map((projekat) => {
      if(projekat._id == id){
        projekatSve = projekat;
      }
    })
    const menadzeri = await userModel.find({pravilo: "Menadzer"});
    const radnici = await userModel.find({pravilo: "Radnik"});
   
    res.render('admin/editproject', { projekat: projekatSve, menadzeri: menadzeri, radnici: radnici, admin: req.session.admin});

};


const azurirajProjekatAdmin = async (req, res, next) => {
  const id = req.params.id;
  const {nazivProjekta, pocetniDatum, menadzer, status, datumIsteka, radnici, opis} = req.body;
  
  await projectsModel.findByIdAndUpdate(id, {
    nazivProjekta: nazivProjekta,
    datumPocetka: pocetniDatum,
    datumKraja: datumIsteka,
    menadzer: menadzer,
    radnici: radnici,
    opis: opis,
    status:status
  });

  res.redirect('/listaProjekata');
}


const detaljiProjekta = async function(req, res, next) {

  const id = req.params.id;
  const projekti = await performLookup();
  var projekatZasebno = {};
  projekti.map((projekat) => {
    if(projekat._id == id){
      projekatZasebno = projekat;
    }
  })

  const radnikId = req.session.userId;
  const radnik = await userModel.find({_id : radnikId});
  const zadaci = await tasksModel.find({projekat: id});

  const aktivnostiSve = await activityModel.find();
  var aktivnostiProjekta = [];
  aktivnostiSve.map((aktivnost) => {
    if(aktivnost.projekat == id){
      aktivnostiProjekta.push(aktivnost);
    }
  })
  res.render('admin/projectDetails', {projekat: projekatZasebno, manager: req.session.manager, aktivnosti: aktivnostiProjekta, zadaci: zadaci, admin: req.session.admin, radnik: radnik, radnikId: radnikId });
};



const performLookup = async () => {
   
      const result = await projectsModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'radnici',
            foreignField: 'username',
            as: 'radnici_info'
          }
        },
        {
            $lookup: {
              from: 'users',
              localField: 'menadzer',
              foreignField: 'username',
              as: 'menadzer_info'
            }
          }
      ]).exec();
  
      return result;
  };


module.exports = {listaProjekataAdmin, listaProjekataRadnik, dodajProjekatAdmin, azurirajProjekatAdmin, detaljiProjekta, urediProjekatAdmin};