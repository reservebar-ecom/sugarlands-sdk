
const showLoader = () => {
    const loader = document.querySelector('#loader');
    loader.classList.add('active');
}

const hideLoader = () => {
    const loader = document.querySelector('#loader');
    loader.classList.remove('active');
}

const setLiquid = async () => {
    const liquid = await Liquid({ clientId: 'e009c86821845fb9ccfdf1dc97b0c409d509242f2b09d7ca17e45390' });
    window.liquid = liquid;
}

(async () => {
    await setLiquid();
})();

const setState = ({ name, value }) => {
    window.localStorage.setItem(`_liquid_${name}`, JSON.stringify(value));
    window.dispatchEvent(new Event(name));
}

const getState = (name) => {
    const strValue = window.localStorage.getItem(`_liquid_${name}`);
    return JSON.parse(strValue)
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const dateFormatter = (dateStr) => {
    const dateArray = dateStr.split('-');
    return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`
}

const customerPlacementMap = {
    'standard':'standard',
    'backOrder': 'back_order',
    'preSale': 'pre_sale'
};

const groupingIds = products.map(p=>p.groupingId); 

// const groups = {
//     sugarlands: {
//         name: "Sugarlands",
//         ids: groupingIds
//     }
// }


const groups = products.reduce((acc, obj) => {
    const key = escape(obj.group);
    if (!acc[key]) {
        acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
}, {});

// const groupMap = new Map();

// products.forEach(p => {
//     const updatedGroupIds = (groupMap?.get(p?.group)?.ids || []);
//     updatedGroupIds.push(p.groupingId);
//     groupMap.set(
//         escape(p.group),
//         {
//             name: p.group,
//             ids: updatedGroupIds
//         }
//     )
// });

// const groups = Object.fromEntries(groupMap);

const engravingIcon = `<div class="engraving-icon-wrapper"><div title="Engraving Available" class="engraving-icon"><small> ENGRAVING AVAILABLE</small><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ticket-detailed" viewBox="0 0 16 16">
<path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM5 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z"/>
<path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13Z"/>
</svg></div></div>`;

// Add ReCaptcha

const reCaptchaDiv = document.createElement('div');
reCaptchaDiv.innerHTML = `This site is protected by reCAPTCHA and the Google
<a href="https://policies.google.com/privacy">Privacy Policy</a> and
<a href="https://policies.google.com/terms">Terms of Service</a> apply.
`;
reCaptchaDiv.classList.add('recaptcha-div');
document.body.appendChild(reCaptchaDiv);
