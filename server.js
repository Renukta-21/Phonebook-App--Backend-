require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Contact = require('./models/contact')

const logger = (req, res, next) => {
    // Ignorar las solicitudes OPTIONS y favicon.ico
    if (req.method !== 'OPTIONS' && req.url !== '/favicon.ico') {
        console.log(`Request: ${req.method}  ${req.url}`);
    }
    next();
}


app.use(logger)
app.use(cors())
app.use(express.json())

/* let contactsList = [
    { id: 1, name: "Alice Johnson", number: "123-456-7890" },
    { id: 2, name: "Bob Smith", number: "234-567-8901" },
    { id: 3, name: "Charlie Brown", number: "345-678-9012" },
    { id: 4, name: "David Wilson", number: "456-789-0123" },
    { id: 5, name: "Eva Green", number: "567-890-1234" },
    { id: 6, name: "Frank White", number: "678-901-2345" },
    { id: 7, name: "Grace Lee", number: "789-012-3456" },
    { id: 8, name: "Hank Miller", number: "890-123-4567" },
    { id: 9, name: "Ivy Davis", number: "901-234-5678" },
    { id: 10, name: "Jack Thompson", number: "012-345-6789" }
  ];
   */
const welcomeText = 
`<h1>Phonebook backend</h1>
<p>Access <b>/contacts    </b> for full list</p>
<p>Access <b>/contacts/:id</b> for specific contact</p>`

app.get('/', (req, res)=>{
    res.send(welcomeText)
})

app.get('/contacts', (req, res)=>{
    Contact.find({})
    .then(data=>res.send(data))
    .catch(err=> {
        console.log('There was en error on get /contacts: '+ err)
        res.status(500).send({err:'Error retrieving contacts'})
    })
})

app.get('/contacts/:id', (req, res, next) => {
    Contact.findById(req.params.id)
    .then(contact=> {
        if(contact){
            return res.send(contact)
        }
        res.status(404).send({err:'Contact not found'})
    })
    .catch(err=> next(err))

});

app.delete(`/contacts/:id`, (req, res, next)=>{
    Contact.findByIdAndDelete(req.params.id)
    .then(result=>{
        res.status(202).end()
    })
    
    .catch(err=> next(err))
})
app.post('/contacts', (req, res, next)=>{
    const newElement = req.body  
    if(newElement && newElement.name && newElement.number){
        const newContact = new Contact(newElement)
        newContact.save()
        .then((data)=> {
            console.log(`${data} was saved`)
            res.status(201).send(data)
        })
        .catch(err=> next(err))
    }else{
        res.status(400).send({error:'Content missing in POST'})
    }
})
app.put('/contacts/:id', (req,res, next)=>{
    const updatedNote = req.body
    console.log(req.body)
    Contact.findByIdAndUpdate(req.params.id, updatedNote, {new:true})
    .then(updContact=>{
        if(updContact){
            return res.send(updContact)
        }
        return res.status(404).send({error:"Contact doesn't exist"})
    })
    .catch(err=> next(err))
})

const errorHandler = (err, req, res, next) => {
    console.log('Error---------------------->    ' + err);
    console.log('');

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'Malformatted ID' });
    }else if(err.name==='ValidationError'){
        return res.status(400).send({error:err.message})
    }

    next(err);
};

app.use(errorHandler)

app.listen(process.env.PORT,()=>
console.log('server started on 3001'))