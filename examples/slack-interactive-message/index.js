const { router, slack, text } = require('bottender/router');

async function viewReceipt(context) {
  await context.sendText('No receipt. Thank you for using this bot.');
}

//TODO
async function pullFrom() {
  pullFromLocs = ['Smithfield, Cudahy (1234A)', 'Bacon Bros, Waukesha (8765B)'];
  return pullFromLocs; 
}

//TODO
async function sendTo() {
  sendToLocs = ['Home Place, Sausage Street (5849)', 'Dads Place, Bacon Blvd (3938)', 'Sows Ear Ranch, Applewood (7823)'];
  return sendToLocs; 
}

async function setNumHeads(context) {
  context.state.asn.enroute.head = parseInt(context.event.text.replace( /^\D+/g, ''), 10);
  console.log(context.state.asn.enroute);
}

async function setPullFrom(context, actionVal) {
  // console.log(actionVal);
  // console.log(context.state);
  // console.log(context.state.pfLocCandidates[actionVal]);
  // cur_state = context.state;
  console.log(context.state.asn.scheduled);
  context.state.asn.scheduled.shipfromlocation.name = context.state.pfLocCandidates[actionVal];
  // context.setState(
  //   cur_state
  // );
  console.log(context.state.asn.scheduled);

  await context.sendText('Please tell us an estimate number of heads');
}

async function setSendTo(context, actionVal) {
  // console.log(actionVal);
  // console.log(context.state);
  // console.log(context.state.stLocCandidates[actionVal]);
  console.log(context.state.asn.scheduled);
  context.state.asn.scheduled.shiptolocation.name = context.state.stLocCandidates[actionVal];
  // context.setState({
  //   asn: {
  //     scheduled: {
  //       shiptolocation: {
  //         name: context.state.stLocCandidates[actionVal],
  //       }
  //     }
  //   }
  // });
  console.log(context.state.asn.scheduled);

  pLocs = await pullFrom();
  let pLocsList = [];
  pLocs.forEach(function (item, index) {
    pLocsList.push({'text': item, 'value': index});
  });
  context.setState({
    pfLocCandidates: pLocs
  });

  await context.chat.postMessage({
    attachments: [
      {
        text: 'Where do you want to pull your pigs from?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_pullfrom',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'pull_from_list',
            text: 'Select a location',
            type: 'select',
            options: pLocsList,
          }
        ],
      },
    ],
  });
}

async function createAsn(context) {
  sLocs = await sendTo();
  let sLocsList = [];
  sLocs.forEach(function (item, index) {
    sLocsList.push({'text': item, 'value': index});
  });
  context.setState({
    stLocCandidates: sLocs
  });
  // console.log(context.state);

  await context.sendText('Ok, let\'s schedule a shipment');
  await context.chat.postMessage({
    attachments: [
      {
        text: 'Where do you want to send your pigs to?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_sendto',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'send_to_list',
            text: 'Select a location',
            type: 'select',
            options: sLocsList,
          }
        ],
      },
    ],
  });
}

async function showShipmentMenu(context) {
  context.setState({
    asn: {
      farmer: {
        name: ''
      },
      processor: {
        name: ''
      },
      scheduled: {
        shipfromlocation: {
          name: '',
        },
        shiptolocation: {
          name: '',
        },
      },
      enroute: {
        head: 0,
      },
      shipdate: '',
      status: '',
    }
  }); 
  // console.log(context.state);
  // send a message with buttons and menu
  await context.sendText('Ok, let\'s do some shipment');
  await context.chat.postMessage({
    attachments: [
      {
        text: 'Pick one of the following tasks',
        fallback: 'Something is wrong ...',
        callback_id: 'select_shipment',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'shipment_send',
            text: 'Send',
            type: 'button',
          },
          {
            name: 'shipment_schedule',
            text: 'Schedule',
            type: 'button',
          },
          {
            name: 'shipment_reschedule',
            text: 'Reschedule',
            type: 'button',
          },
        ],
      },
    ],
  });
}

async function showActionMenu(context) {
  // send a message with buttons and menu
  await context.sendText('Hello pork lover! I am your bot. Please make your selection.');
  await context.chat.postMessage({
    attachments: [
      {
        text: 'View receipt or do a shipment?',
        fallback: 'Something is wrong ...',
        callback_id: 'select_action',
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'view_receipt',
            text: 'View Receipt',
            type: 'button',
          },
          {
            name: 'shipment',
            text: 'Shipment',
            type: 'button',
          },
        ],
      },
    ],
  });
}

async function HandleInteractiveMessage(context) {
  await context.sendText(
    `I received your '${context.event.callbackId}' action`
  );
  switch (context.event.callbackId) {
    case 'select_action':
      switch (context.event.action.name) {
        case 'shipment':
          showShipmentMenu(context);
          break;
        case 'view_receipt':
          viewReceipt(context);
          break;
      }
      break;
    case 'select_shipment':
      switch (context.event.action.name) {
        case 'shipment_send':
          break;
        case 'shipment_schedule':
          createAsn(context);
          break;
        case 'shipment_reschedule':
          break;
      }
      break;
    case 'select_sendto':
      let sVal = context.event.action.selectedOptions[0].value;
      setSendTo(context, sVal);
      break;
    case 'select_pullfrom':
      let pVal = context.event.action.selectedOptions[0].value;
      setPullFrom(context, pVal);
      break;
    default:
      break;
  }
  //pullFromOada();
  //sendText(oada_data);
}

module.exports = async function App(context) {
  return router([
    text(/\d+/i, setNumHeads),
    text('*', showActionMenu),
    slack.event('interactive_message', HandleInteractiveMessage),
  ]);
};
