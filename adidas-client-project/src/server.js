// Test Server

var io = require('socket.io')();

const port = 8000;
io.listen(port);
console.log('listening on port ', port);

io.on('connection', (client) => {

  client.on('message', (message) => {
    console.log('receiving message: ', message)
  })

  const usersList = [...Array(8)].map((x, i) => {
    return {
      id: 'id'+i,
      name: 'John Doe '+i,
      status: i%2 ? 'requires_attention' : 'inactive',
      messages: i < 3 ? [] : [{
        id: 2,
        type: 'user',
        content: 'Want to buy something '+i
      }]
    }
  })
  client.emit('users-list', usersList)



  setTimeout(() => {
    client.emit('users-add', {
      id: 66,
      name: 'John Doe 66',
      status: 'active',
      messages: [{
        id: 2,
        type: 'user',
        content: 'Want to buy something 66'
      },{
        id: 3,
        type: 'user',
        image: 'http://i.pravatar.cc/450'
      }]
    });
  }, 1000);


  setTimeout(() => {
    client.emit('user-change-status', {
      id: 66,
      status: 'requires_attention'
    });
  }, 2000);

  // setInterval(() => {
    client.emit('new-message', {
      userId: 66,
      type: 'user',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
    });
  // }, 2000);
});