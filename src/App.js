import React from 'react'
import Chatkit from '@pusher/chatkit-client'
import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'
import RoomList from './components/RoomList'
import NewRoomForm from './components/NewRoomForm'

import { tokenUrl, instanceLocator } from './config'

class App extends React.Component {
    constructor() {
        super()
        this.state = {
            currentRoomId: null,
            joinableRooms: [],
            joinedRooms: [],
            messages: []
        }
        this.subscribeToRoom = this.subscribeToRoom.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
      //  this.subscribeToRoom = this.subscribeToRoom.bind(this)
    }

    componentDidMount () {
        const chatManager = new Chatkit.ChatManager({
                instanceLocator: instanceLocator,
                userId: "kpsadmin",
                tokenProvider: new Chatkit.TokenProvider({
                    url: tokenUrl
            })
        })

        chatManager.connect()
        .then(currentUser => {
            this.currentUser = currentUser
            return this.currentUser.getJoinableRooms()
            .then(joinableRooms => {
                this.setState({
                    joinableRooms,
                    joinedRooms: this.currentUser.rooms
                })
            })           
        })
        .catch(err => console.log('error connecting: ', err))
    }

    sendMessage(text) {
        this.currentUser.sendMessage({
            text,
            roomId: this.state.currentRoomId
        })
    }

    createRoom(name) {
        this.currentUser.createRoom({
            name
        })
        .then(room => this.subscribeToRoom(room.id))
        .catch(err => console.log(err))
    }

    subscribeToRoom(roomId) {
        this.setState({
            messages: []
        });
        this.currentUser.subscribeToRoom({
            roomId: roomId,
            hooks: {
                onMessage: message => {
                    console.log('message.text: ', message.text);
                    this.setState({
                        messages: [...this.state.messages, message]
                    })
                }
            }
        })
        .then(currentRoom => {
            this.setState({currentRoomId: currentRoom.id})
            return this.currentUser.getJoinableRooms()
            .then(joinableRooms => {
                this.setState({
                    joinableRooms,
                    joinedRooms: this.currentUser.rooms
                })
            })
        })
        .catch(err => console.log('error on subscribing: ', err))
    }





    
    render() {
       
      
    //    chatkit.fetchMultipartMessages({
    //     roomId: room.id,
    //     limit: 10,
    //   })
    //     .then(messages => {
    //       console.log('got last 10 messages')
    //       for (let m of messages) {
    //         renderMessage(m)
    //       }
    //       return chatkit.fetchMultipartMessages({
    //         roomId: room.id,
    //         initialId: res[messages.length - 1].id,
    //       })
    //     })
    //     .then(moreMessages => {
    //       console.log('got the next 10 messages before them')
    //       for (let m of moreMessages) {
    //         renderMessage(m)
    //       }
    //     })
    //     .catch(err => console.error(err)) 
       
        return (
            <div className="app">
                <RoomList
                    rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]}
                    subscribeToRoom={this.subscribeToRoom}
                    currentRoomId={this.state.currentRoomId} />
                <MessageList
                    currentRoomId={this.state.currentRoomId}
                    messages={this.state.messages} />
          <div className = "blank1"></div>
            
                <NewRoomForm onSubmit={this.createRoom.bind(this)} />
                <SendMessageForm
                    sendMessage={this.sendMessage}
                    disabled={!this.state.currentRoomId} />
            
            <div className = "blank2"></div>
            </div>
        );
    }
}

export default App