const socketIO = require('socket.io')
const userModel = require('./models/users')
const chatModel = require('./models/chat')
const notificationsModel = require('./models/notifications');

const prikaziObavjesti = async (socket) => {
  console.log("pozvana fukncija")
  const obavjesti = await notificationsModel.find({procitano: '0'});
  socket.emit('prikaz', obavjesti)
}

function setupSocket(server) {
  const io = socketIO(server);

  var ups = io.of('/konektovan')
  
  ups.on('connection', async (socket) => {
    console.log('Klijent povezan');
    prikaziObavjesti(socket);

    var userId = socket.handshake.auth.token
    await userModel.findByIdAndUpdate(userId, { $set: {online: '1'}})

    socket.broadcast.emit('onlineUser', {userId: userId})

    socket.on('disconnect', async function() {
      console.log("Klijent diskonektovan");
      var userId = socket.handshake.auth.token
      await userModel.findByIdAndUpdate(userId, { $set: {online: '0'}})

      socket.broadcast.emit('offlineUser', {userId: userId})


    });

    socket.on('newChat', (poruka) => {
      socket.broadcast.emit('loadNewChat', poruka)
    })

    socket.on('existsChats', async (korisnici) => {
      const chats = await chatModel.find({
        $or: [
          {posiljaoc: korisnici.posiljaoc, primaoc: korisnici.primaoc},
          {posiljaoc: korisnici.primaoc, primaoc: korisnici.posiljaoc}
        ]
      })
      socket.emit('loadChats', {chats: chats});
    })

    socket.on('message', async (data) => {
      const novaObavjest = new notificationsModel({
        primaoc: data.primaoc,
        posiljaoc: data.posiljaoc,
        poruka: data.poruka,
        imePosiljaoca: data.ime
      })
      await novaObavjest.save();
      socket.emit('response'); 

    });


    socket.on('citajObavjesti', async () => {
      const obavjesti = await notificationsModel.find({procitano: '0'});
      console.log("Emitiraj svima")
      socket.broadcast.emit('prikaz', obavjesti)
    })

    socket.on('azurirajObavjest', async (data) => {
      console.log("Azuriram obavjest:", data)
      if(data.obavjestVrsta === 'poruka'){
        await notificationsModel.updateMany({posiljaoc: data.posiljaocIdKlasno, primaoc: data.posiljaocId}, {procitano: '1'});
      }else {
        await notificationsModel.findByIdAndUpdate(data.obavjestId, {procitano: '1'});
      }
      prikaziObavjesti(socket)
    })


    socket.on('projekat',async (data) => {
      
      data.radnici.map(async (radnik) => {
        const novaObavjest = new notificationsModel({
          primaoc: radnik,
          posiljaoc: data.posiljaocId,
          vrsta: 'projekat',
          poruka: "Dodani ste na novi projekat",
          imePosiljaoca: data.ime,
          projekat: "postoji"
        })
        await novaObavjest.save();
      })
      socket.emit('response'); 
    })





  });
  return io;

}

module.exports = setupSocket;
