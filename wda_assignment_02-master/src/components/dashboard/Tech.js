import React, {Component} from 'react';
import { apiurl } from "../../helpers/constants";
import firebase from 'firebase';
import { Panel } from 'react-bootstrap';

//WYSIWYG Editor
import { Editor } from 'react-draft-wysiwyg';
import { convertFromRaw } from 'draft-js';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


//UI Button LIB
import { Button } from 'react-bootstrap';

const content = {"entityMap":{},"blocks":[{"key":"637gr","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]};

class Tech extends Component {
    constructor(props) {
        super(props);
        const contentState = convertFromRaw(content);
        this.state = {
            tickets: [],
            contentState: {},
            selectedTicket: '',
            status: 'In Progress',
            selectedHelpdesk: null,
            helpdeskUsers: [],
            ticket_details_id: null,
            escLevel: ''
        };
        
        //BINDING OF FORM ELEMENTS
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleIdChange = this.handleIdChange.bind(this);
    };

    componentDidMount() {
        // Call this function when the page is loaded.
        this.fetchTicketToTech();
    }

    fetchTicketToTech() {
        /*
         * Fetch all tickets and check which tickets have
         * been assigned to this tech user
         */
        fetch(apiurl + 'api/tickets')
            .then((response) => response.json())
            .then((responseJson) => {
                const myTickets = [];
                for(const ele in responseJson) {
                    firebase.database().ref('ticket/'+responseJson[ele].id).on('value', (snapshot) => {
                        if(snapshot.val() !== null && snapshot.val().user_id === this.props.user.uid) {
                            myTickets.push(responseJson[ele]);
                            /* Force the view to re-render (async problem) */
                            this.forceUpdate();
                        }
                    })
                }
                return myTickets;
            })
            .then((tickets) => {
                this.setState({
                    tickets: tickets
                });
            })

        // Add more users whenever new helpdesk user is registered in firebase.
        const users = firebase.database().ref('user/')
        users.on('value', (snapshot) => {
            const tempHelp = [];
            for(const ele in snapshot.val()) {
                if(snapshot.val()[ele].type === 'helpdesk') {
                    tempHelp.push(snapshot.val()[ele]);
                }
            }
            this.setState({
                helpdeskUsers: tempHelp
            });
        })
    }


    // WYSIWYG Function
    onContentStateChange = (contentState) => {
        this.setState({
          contentState,
        });
    };

    // Change escLevel if necessary
    handleEscLevel = (e) => {
        this.setState({
            escLevel: e.target.value
        });
    }

    // Check the if the status is changed.
    handleStatusChange = (e) => {
        this.setState({
            status: e.target.value
        });
        console.log(this.state.status);
    };

    // Select the id to add comments or change status
    handleIdChange = (e) => {
        this.setState({
            selectedTicket: e.target.value
        });
        console.log(this.state.selectedTicket);
    }


    //Posting of comments that are styled to the database
    fetchComment = () => {
        fetch(apiurl + 'api/tickets/'+ this.state.selectedTicket + '/comment', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                ticket_details_id: this.state.selectedTicket,
                comment : this.state.contentState.blocks[0].text
            })
        });
        //CONSOLE LOG THE OUTPUTS
        console.log("Ticket ID :"+ this.state.selectedTicket);
        console.log(this.state.contentState.blocks[0].text);   
    };

    // Update escLevel in MySQL Database
    fetchEscLevel() {
        fetch(apiurl + 'api/tickets/'+ this.state.selectedTicket + '/esclevel', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({
                escLevel : this.state.escLevel
            })
        });
    }

    // Change status after work
    // If the request is not solved, it will get back to the helpdesk again.
    fetchStatus = () => {
        fetch(apiurl + 'api/tickets/'+ this.state.selectedTicket + '/status', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({
                status : this.state.status
            })
        });

        // need draftToHtml text to use some text effect
        console.log("STATUS: "+ this.state.status);
        console.log("SELECTED TICKET: "+ this.state.selectedTicket);
    };

    // Select the helpdesk user if the ticket is not solved successfully.
    handleHelpdeskChange = (e) => {
        this.setState({
            selectedHelpdesk: e.target.value
        });
    };

    // Callback function when assign button is clicked.
    resolveTicket = () => {
        this.fetchStatus();
        this.fetchComment();
        this.fetchEscLevel();
        if(this.state.selectedHelpdesk === null) {
            return;
        }

        /*
         * After the ticket's status is changed,
         * it gets back to Helpdesk user again.
         */
        const data = 'ticket/' + this.state.selectedTicket;

        firebase.database().ref(data).remove();
        alert('Tech successfully assigned to ticket!');

        console.log("tech user id: " + this.state.selectedHelpdesk);

        this.setState({
            selectedTicket: ''
        })

        this.fetchTicketToTech();

    };

    render () {
        const { tickets, helpdeskUsers } = this.state;
        const { contentState } = this.state;
        return (
            <div>
                <h1>My Tickets</h1>
                {tickets.length < 1 ? (
                        <div className="alert alert-info">You have not been assigned any tickets.</div>
                    )
                    : tickets.map((ticket, i) => (
                        <Panel key={i} header={ticket.id}>
                            <p>OS: {ticket.os}</p>
                            <p>ISSUE: {ticket.issue}</p>
                            <p>STATUS: {ticket.status}</p>
                            <p>PRIORITY: {ticket.priority}</p>
                            <p>ESC LEVEL: {ticket.escLevel}</p>
                            <p>COMMENTS:
                                {ticket.comments.map((comment, i) => (
                                    <span key={i}>
                                        <br/>
                                        <span className="boldText">{i === 0 ? "User" : "Staff"}</span>: {comment.comment}
                                    </span> 
                                ))}
                            </p>


                        </Panel>
                    ))}
                <hr/>


                <h3 className="text-uppercase">Ticket ID</h3>
                {tickets.length < 1 ? (
                        <hr/>
                    ):
                    <select className="form-control" value={this.state.selectedTicket} onChange={this.handleIdChange}>
                        <option value="default" defaultValue disabled>Select the Ticket ID</option>
                        {tickets.map((ticket, i) => (
                            <option key={i} value={ticket.id}>{ticket.id}</option>
                        ))}
                    </select>
                }

                <h2>Add Comments</h2>
                <Editor
                  placeholder="Add Comments Here"
                  defaultContentState={content}
                  wrapperClassName="wysEditorWrapper"
                  editorClassName="demo-editor"
                  onContentStateChange={this.onContentStateChange}
                />


                <h3 className="text-uppercase">Ticket Status</h3>
                <select className="form-control" value={this.state.status} onChange={this.handleStatusChange}>
                    <option value="In Progress">In Progress</option>
                    <option value="Unresolved">Unresolved</option>
                    <option value="Resolved">Resolved</option>
                </select>

                <h3 className="text-uppercase">Select EscLevel</h3>
                <select id="escLevel" className="form-control" value={this.state.escLevel} onChange={this.handleEscLevel}>
                    <option value="-1" defaultValue disabled>Select the EscLevel</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>

                <h3 className="text-uppercase">Assign to Helpdesk</h3>
                <select className="form-control" onChange={this.handleHelpdeskChange} defaultValue="-1">
                    <option value="-1" defaultValue disabled>Select a helpdesk user</option>
                    {helpdeskUsers.map((user, i) => (
                        <option key={i} value={user.id}>{user.name}</option>
                    ))}
                </select>

                <div className="clearfix"><br/>
                    <Button className="pull-right" bsStyle="success" onClick={this.resolveTicket}>Assign</Button>
                </div>
            </div>
        );
    }
}

export default Tech;