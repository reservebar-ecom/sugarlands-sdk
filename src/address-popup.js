// Address Modal
const addressOpenButton = document.querySelector('#popup-open');
const addressCloseButton = document.querySelector('#popup-close');
const addressModal = document.querySelector('#popup');
const addressModalBg = document.querySelector('#popup-background');

const closeAddressModal = () => {
    addressModal.classList.remove('active');

    const address = getState('address');

    if(!address){
        // set default address
        setState({
            name: 'address',
            value: {
                "description": "120 Nassau St, Brooklyn, NY 11201, USA",
                "placeId": "ChIJGz_5rjVawokRz7nKEpkWXnM"
            }
        });
    }
}

const openAddressModal = () => {
    addressModal.classList.add('active');
}

addressOpenButton.onclick = () => {
    openAddressModal();
}

addressCloseButton.onclick = () => {
    closeAddressModal();
}

addressModalBg.onclick = () => {
    closeAddressModal();
}

// Address input
const addressInput = document.querySelector('#address-input');
const addressOptions = [...document.querySelectorAll('.address-option')];

const isAddressValid = (address) => {

    return (
        address?.streetNumber &&
        address?.address1 &&
        address?.zipCode &&
        address?.latitude &&
        address?.longitude &&
        address?.state &&
        address?.zipCode
    )
}

const address = getState('address');
if (address) {
    addressInput.value = address.description;
    addressOpenButton.innerHTML = address.description;
} else {
    openAddressModal();
}

let isTypingAddress = false;

addressInput.oninput = async (e) => {
    if (!isTypingAddress) {
        isTypingAddress = true;
        await setTimeout(async () => {

            const addressSearch = e.target.value;
            if (addressSearch.trim()) {
                if (!window.liquid) {
                    await setLiquid();
                }
                const addressSuggestions = await liquid.address({ search: addressSearch });

                // Clear previous suggestions
                addressOptions.forEach(addressOption => {
                    addressOption.innerHTML = '';
                    addressOption.classList.remove('visible');
                })

                // Include new suggestions
                addressSuggestions.forEach(
                    (addressSuggestion, index) => {
                        addressOptions[index].innerHTML = addressSuggestion.description;
                        addressOptions[index].id = addressSuggestion.placeId;
                        addressOptions[index].classList.add('visible');
                    });
            } else {
                addressOptions.forEach(el => el.classList.remove('visible'));
            }

            isTypingAddress = false;
        }, 800);
    }
}

addressOptions.forEach(addressOption => {
    addressOption.onclick = async () => {

        const addressDescription = addressOption.innerText;
        const addressPlaceId = addressOption.id;

        const addressObj = await liquid.address({ placeId: addressPlaceId });

        if (isAddressValid(addressObj)) {
            setState({
                name: 'address',
                value: {
                    description: addressDescription,
                    placeId: addressPlaceId
                }
            });

            setState({ name: 'cart', value: null });
        } else {

            // Address is invalid
           const addressHeader = document.querySelector('#popup-modal h4');
           addressHeader.innerText = 'Address is missing street number';
           addressHeader.style.color = 'brown';

           setTimeout(()=>{
            addressHeader.innerText = 'Enter your delivery address';
            addressHeader.style.color = 'black';
            addressHeader.value = '';
           }, 2000);
        }
    }
});

// ADDRESS Event Listener
window.addEventListener('address', async function (e) {
    const address = getState('address');
    const addressInput = document.querySelector('#address-input');
    addressInput.value = address?.description || '';
    addressOpenButton.innerHTML = address?.description || 'Enter Delivery Address';

    let addressObj = null;

    if (address?.placeId) {
        if (!window.liquid) {
            await setLiquid();
        }
        addressObj = await liquid.address({ placeId: address?.placeId });
    }
    const groupingIds = getState('grouping_ids');

    if (groupingIds) {
        if (!window.liquid) {
            await setLiquid();
        }

        const products = await liquid.product({
            ids: groupingIds,
            ...(addressObj && { latitude: addressObj?.latitude }),
            ...(addressObj && { longitude: addressObj?.longitude })
        });

        setState({ name: 'products', value: products || null });
    }
    addressOptions.forEach(el => el.classList.remove('visible'));

    if (addressObj) {
        closeAddressModal();
    }
});