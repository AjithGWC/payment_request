domo.get("/domo/users/v1?includeDetails=true&limit=200").then(function(data){
    // console.log(data);
    const selectBox = document.getElementById('users');

    $(document).ready(function() {
        $('.mySelect').select2();
    });

    data.forEach(async function(items){
        let optionElement = document.createElement('option'); 
        optionElement.value = items.detail.email;
        optionElement.textContent = items.displayName;
        selectBox.appendChild(optionElement);
        if (items.id == domo.env.userId) {
            let displayName = items.displayName;
            name(displayName);
        }
    });
    $(document).ready(function() {
        $('#users').on('change', function() {
            var selectedOption = $(this).val();
            data.forEach(function(user){
                if(selectedOption == user.detail.email){
                    let name = document.getElementById('name');
                    let email = document.getElementById('email');
                    name.value = user.displayName;
                    email.value = selectedOption;
                }
            });
        });
    });
});

domo.get('/data/v1/currency').then(function(datas){
    // console.log(datas);
    const country = document.getElementById('country');

    $(document).ready(function() {
        $('.country').select2();
    });

    $(document).ready(function() {
        $('.company').select2();
    });

    $(document).ready(function() {
        $('.Account').select2();
    });

    datas.forEach(async function(item){
        let optionElement = document.createElement('option');
        optionElement.value = item.Lek_2;
        optionElement.textContent = item.Lek_2 + ' ' + '-' + ' ' + item.Lek + ' ' + '(' + item.Albania + ')';
        country.appendChild(optionElement);
    });
});

let dates = document.getElementById('datepicker');
let today = new Date();
let current = today.toISOString().slice(0, 10);
dates.min = current;

let text = document.getElementById('text');
dates.addEventListener('change', function (){
    let current_date = new Date().toISOString().slice(0, 10);
    let date = dates.value;
    if (date > current_date) {
        let date1 = new Date(date);
        let date2 = new Date(current_date);
        let difference = date1.getTime() - date2.getTime();
        let Days = Math.ceil(difference / (1000 * 60 * 60 * 24));
        text.textContent = `${Days} Days from now`;
    }else if(date == current_date){
        text.textContent = `Today is the last date`;
    }else{
        text.textContent = ``;
    }
});

function name(displayName) {
    let send_email = document.getElementById('send-email');
    send_email.addEventListener('click', function() {

        let company = document.getElementById('company').value;
        let receiver_name = document.getElementById('name').value;
        let Amount = document.getElementById('Amount').value;
        let country = document.getElementById('country').value;
        let date = document.getElementById('datepicker').value;
        let Account = document.getElementById('Account').value;
        if(company == ''){
            alert('Company cannot be empty');
        }else if(receiver_name == ''){
            alert('Please Select an User');
        }else if(Amount == ''){
            alert('Amount cannot be empty');
        }else if(country == ''){
            alert('Country cannot be empty');
        }else if(date == ''){
            alert('Date cannot be empty');
        }else if(Account == ''){
            alert('Please Select an Account');
        }else{
            SendEmailLoop(displayName);
        }
    });
}


function SendEmailLoop(displayName){
    const selects = document.getElementById('users');
    const values = Array.from(selects.selectedOptions).map(option => option.value);
    values.forEach(
        function (personId) {
            let html = `
                <div class="h-16 mt-2 bg-green-100 w-64 border border-green-400 px-4 py-3 rounded relative hide" role="alerts" style="top:35%;">
                    <strong class="mt-2 font-bold">${personId}</strong>
                    <span class="absolute top-0 bottom-0 right-0" id="close_${personId}">
                    <svg class="fill-current ml-5 h-6 w-6 text-black" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </div>
            `;
            let alerts = document.getElementById('alert');
            alerts.innerHTML += html;
            alerts.style.display = 'block';

            let closeButton = document.getElementById(`close_${personId}`);
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    alerts.style.display = 'none';
                });
            }
            SendEmail(to = personId, displayName)
        }
    )
};

function SendEmail(to, displayName) {
    // console.log(to);
    let company = document.getElementById('company').value;
    let subject = 'Payment Request from' + ' ' + company + ' ' + displayName;
    let receiver_name = document.getElementById('name').value;
    let Amount = document.getElementById('Amount').value;
    let country = document.getElementById('country').value;
    let date = document.getElementById('datepicker').value;
    let Account = document.getElementById('Account').value;
    
    let body = `
        <script src="https://cdn.tailwindcss.com"></script>
        <div class="flex">
            <p>Hi ${receiver_name}<br><br>${company} ${displayName}, requested ${country}${Amount} Payment.<br>you need to make a Payment before ${date}<br><br>Thanks,<br>${displayName}</p>
        </div>
    `
    async function startWorkflow(alias, body) {
        const response = await domo.post(`/domo/workflow/v1/models/${alias}/start`, body);
    }
    
    if(company == ''){
        alert('Company cannot be empty');
    }else if(receiver_name == ''){
        alert('Please Select an User');
    }else if(Amount == ''){
        alert('Amount cannot be empty');
    }else if(country == ''){
        alert('Country cannot be empty');
    }else if(date == ''){
        alert('Date cannot be empty');
    }else if(to == ''){
        alert('Email cannot be empty');
    }else if(Account == ''){
        alert('Please Select an Account');
    }else{
        domo.get("/domo/users/v1?includeDetails=true&limit=200").then(function(domo_users){
            let requested_name = '';
            let requested_id = '';
            domo_users.forEach(function(users){
                if(users.detail.email == to){
                    // console.log(users);
                    requested_name = users.displayName;
                    requested_id = users.id;
                }
            });
            // console.log(requested_name);
            const request = {
                "content":{
                    'requested_by': {
                        'requester_name': `${displayName}`,
                        'requester_id': `${domo.env.userId}`
                    },
                    'requested_to': {
                        'requested_id': `${requested_id}`,
                        'requested_name':  `${requested_name}`,
                        'requested_email': `${to}`
                    },
                    'request_details': {
                        'amount': {
                            'currency': `${country}`,
                            'amount': `${Amount}`,
                            'due_date': `${date}`
                        }
                    },
                    'company_name': `${company}`,
                    'account': `${Account}`
                }
            }
    
            domo.post(`/domo/datastores/v1/collections/Payment_request/documents/`, request); 
        });
        
        startWorkflow("send_email", { to: to, subject: subject, body: body });
    }
}