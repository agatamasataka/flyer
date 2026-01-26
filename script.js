const pricingData = {
    osaka: {
        flyer: {
            standard: {
                options: [
                    { value: 'A5/B5', label: 'A5/B5', price: 3.5 },
                    { value: 'A4/B4', label: 'A4/B4', price: 3.8 },
                    { value: 'A3/B3', label: 'A3/B3', price: 5.3 },
                    { value: 'A2/B2', label: 'A2/B2', price: 7.8 },
                    { value: 'A1/B1', label: 'A1/B1', price: 12.8 },
                    { value: 'postcard', label: 'ハガキ類', price: 4.3 },
                    { value: 'magnet', label: 'マグネット', price: 6.3 }
                ],
                minQty: 10000
            },
            thick: {
                options: [
                    { value: 'A5/B5', label: 'A5/B5', price: 4.0 },
                    { value: 'A4/B4', label: 'A4/B4', price: 4.3 },
                    { value: 'A3/B3', label: 'A3/B3', price: 6.0 },
                    { value: 'quote', label: 'A2/B2 (別途見積)', price: null },
                    { value: 'na', label: 'A1/B1 (-)', price: null }
                ],
                minQty: 10000
            }
        }
    },
    nara: {
        flyer: {
            standard: {
                options: [
                    { value: 'A5/B5', label: 'A5/B5', price: 2.8 },
                    { value: 'A4', label: 'A4', price: 3.1 },
                    { value: 'B4', label: 'B4', price: 3.1 },
                    { value: 'A3', label: 'A3', price: 4.3 },
                    { value: 'B3', label: 'B3', price: 4.3 }
                ],
                minQty: 10000
            },
            thick: {
                options: [
                    { value: 'A5/B5', label: 'A5/B5', price: 3.3 },
                    { value: 'A4', label: 'A4', price: 3.6 },
                    { value: 'B4', label: 'B4', price: 3.6 },
                    { value: 'A3', label: 'A3', price: 5.3 },
                    { value: 'B3', label: 'B3', price: 5.3 }
                ],
                minQty: 10000
            }
        }
    }
};

const bookletData = {
    options: [
        { value: '20', label: '20g以下', price: 6.5 },
        { value: '25', label: '20g超 〜 25g以下', price: 8.0 },
        { value: '50', label: '25g超 〜 50g以下', price: 12.0 },
        { value: '75', label: '50g超 〜 75g以下', price: 15.0 },
        { value: '100', label: '75g超 〜 100g以下', price: 17.0 },
        { value: '125', label: '100g超 〜 125g以下', price: 19.0 },
        { value: '150', label: '125g超 〜 150g以下', price: 21.0 },
        { value: '175', label: '150g超 〜 175g以下', price: 23.0 },
        { value: '200', label: '175g超 〜 200g以下', price: 25.0 }
    ],
    minQty: 5000
};

// DOM Elements
const areaSelect = document.getElementById('area');
const itemTypeRadios = document.getElementsByName('itemType');
const paperTypeSelect = document.getElementById('paperType');
const flyerSizeSelect = document.getElementById('flyerSize');
const weightSelect = document.getElementById('weight');
const quantityInput = document.getElementById('quantity');
const unitPriceDisplay = document.getElementById('unitPrice');
const totalPriceDisplay = document.getElementById('totalPrice');
const minQuantityMsg = document.getElementById('minQuantityMsg');

const flyerOptionsDiv = document.getElementById('flyerOptions');
const bookletOptionsDiv = document.getElementById('bookletOptions');

// Helper to get current item type
function getItemType() {
    for (const radio of itemTypeRadios) {
        if (radio.checked) return radio.value;
    }
    return 'flyer';
}

function updateOptions() {
    const area = areaSelect.value;
    const itemType = getItemType();

    // Toggle Sections
    if (itemType === 'flyer') {
        flyerOptionsDiv.classList.remove('hidden');
        bookletOptionsDiv.classList.add('hidden');
    } else {
        flyerOptionsDiv.classList.add('hidden');
        bookletOptionsDiv.classList.remove('hidden');
    }

    // If flyer, update sizes based on Area & Paper Type
    if (itemType === 'flyer' && area) {
        const paperType = paperTypeSelect.value;
        const data = pricingData[area]['flyer'][paperType];

        // Save current selection if possible
        const currentSize = flyerSizeSelect.value;

        flyerSizeSelect.innerHTML = '';
        data.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            option.dataset.price = opt.price !== null ? opt.price : 'quote';
            flyerSizeSelect.appendChild(option);
        });

        // Attempt to restore selection
        // Logic: checking if the previously selected value exists in the new list
        const exists = Array.from(flyerSizeSelect.options).some(o => o.value === currentSize);
        if (exists) flyerSizeSelect.value = currentSize;
    } else if (itemType === 'booklet') {
        // Booklet options are static for now, so no re-render needed unless area deps exist
    }

    calculate();
}

function calculate() {
    const area = areaSelect.value;
    const itemType = getItemType();
    const qty = parseInt(quantityInput.value) || 0;

    // Reset messages
    minQuantityMsg.classList.add('hidden');
    unitPriceDisplay.textContent = '-';
    totalPriceDisplay.textContent = '-';

    if (!area) return; // Need area selected

    let price = 0;
    let minQty = 0;

    if (itemType === 'flyer') {
        const paperType = paperTypeSelect.value;
        const sizeValue = flyerSizeSelect.value;

        // Get data
        if (!pricingData[area]) return;
        const dataSet = pricingData[area]['flyer'][paperType];
        minQty = dataSet.minQty;

        const selectedOption = dataSet.options.find(o => o.value === sizeValue);
        if (selectedOption && selectedOption.price !== null) {
            price = selectedOption.price;
        } else {
            // Handle quote or null
            unitPriceDisplay.textContent = '別途見積';
            return;
        }

    } else {
        // Booklet
        minQty = bookletData.minQty;
        const weightValue = weightSelect.value;
        const selectedOption = bookletData.options.find(o => o.value === weightValue);
        if (selectedOption) {
            price = selectedOption.price;
        }
    }

    // Validate Quantity
    if (qty < minQty) {
        minQuantityMsg.textContent = `※最低${minQty.toLocaleString()}枚以上でお願いします。`;
        minQuantityMsg.classList.remove('hidden');
        // We can still show unit price but maybe not total? Or just show both.
        // Prompt implies specific rules, usually you assume valid quantity for total.
        // I will show unit price but indicate invalid total or just calc it anyway but show warning?
        // Let's calc it but keep warning visible.
    }

    // Display
    unitPriceDisplay.textContent = price.toFixed(1); // Japanese yen often integers but table has decimals (3.5)

    if (qty > 0) {
        const total = Math.floor(price * qty); // Round down usually
        totalPriceDisplay.textContent = total.toLocaleString() + ' 円';
    } else {
        totalPriceDisplay.textContent = '-';
    }
}

// Map Interaction
const mapZones = document.querySelectorAll('.map-zone');

function updateMapState(selectedArea) {
    mapZones.forEach(zone => {
        if (zone.dataset.target === selectedArea) {
            zone.classList.add('active');
        } else {
            zone.classList.remove('active');
        }
    });
}

mapZones.forEach(zone => {
    zone.addEventListener('click', () => {
        const target = zone.dataset.target;
        areaSelect.value = target;
        // Trigger change event manually to update options
        areaSelect.dispatchEvent(new Event('change'));
    });
});

// Event Listeners
areaSelect.addEventListener('change', () => {
    updateMapState(areaSelect.value);
    updateOptions();
});
itemTypeRadios.forEach(r => r.addEventListener('change', updateOptions));
paperTypeSelect.addEventListener('change', updateOptions);
flyerSizeSelect.addEventListener('change', calculate);
weightSelect.addEventListener('change', calculate);
quantityInput.addEventListener('input', calculate);

// Initial Call
updateMapState(areaSelect.value);
updateOptions();
