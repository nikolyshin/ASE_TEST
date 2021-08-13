const oneYear = 100;
const tables = [];
const objects = data.objects.map((element) => element)
const scene = ($(document).find('.scene'));
const filtersWrapper = $('<div>')
    .addClass('filtersWrapper')
    .appendTo(scene);
const wrapper = $('<div>')
    .addClass('wrapper')
    .appendTo(scene);

createDropdown(filtersWrapper, 'Filter of objects', objects);
createDateFilter(filtersWrapper);
createButtonSave(filtersWrapper);

objects.forEach((object) => {

    const startYear = new Date(object.works[0].contractDate).getFullYear();
    const endYear = new Date(object.works[object.works.length - 1].contractDate).getFullYear();
    const countYears = endYear - startYear

    const table = $('<div>')
        .data('object', object.name)
        .addClass('table')
        .appendTo(wrapper);
    $('<div>')
        .html(object.name)
        .addClass('wrapperName')
        .appendTo(table);
    const wrapperColumns = $('<div>').addClass('wrapperColumns').appendTo(table);
    for (let i = 0; i <= countYears; i++) {
        let column = $('<div>')
            .addClass('column')
            .data('date', startYear + i)
            .appendTo(wrapperColumns);
        for (let j = 0; j < 3; j++) {
            let line = $('<div>')
                .addClass('line line_' + j)
                .css('width', oneYear)
                .appendTo(column);
            if (j === 0) line.html(startYear + i)
        }
    }

    const axisWrapper = $('<div>')
        .addClass('axisWrapper')
        .appendTo(wrapperColumns);
    createLines(axisWrapper, object, countYears + 1)

    tables.push(table)
})

function createLines(parent, object, countYears) {
    const height = 100;
    const width = countYears * oneYear;
    const oneDay = 1000 * 60 * 60 * 24;

    const svg = d3.select($(parent)[0]).append('svg')
        .attr('class', 'axis')
        .attr('width', width)
        .attr('height', height);

    // contract 
    const contractDates = object.works.map(work => new Date(work.contractDate))
    const contractStartTime = (new Date(object.works[0].contractDate).getTime())
    const firstDayOfTheYearContarct = new Date(new Date(object.works[0].contractDate).getFullYear(), 0, 1).getTime();
    const countDaysFromNewYearContract = (contractStartTime - firstDayOfTheYearContarct) / oneDay;

    const differenceContractDates = new Date(object.works[object.works.length - 1].contractDate).getTime() - contractStartTime;

    const scaleContract = d3.time.scale()
        .domain([new Date(object.works[0].contractDate), new Date(object.works[object.works.length - 1].contractDate)])
        .range([0, 102 / 365 * differenceContractDates / oneDay]);

    const axisContract = d3.svg.axis()
        .scale(scaleContract)
        .orient('top')
        .tickValues(contractDates)
        .tickFormat(d3.time.format('%d.%m.%y'));

    // actual     
    const actualDates = object.works.map(work => new Date(work.actualDate));
    const actualStartTime = (new Date(object.works[0].contractDate).getTime())
    const firstDayOfTheYearActual = new Date(new Date(object.works[0].actualDate).getFullYear(), 0, 1).getTime();
    const countDaysFromNewYearActual = (actualStartTime - firstDayOfTheYearActual) / oneDay;

    const differenceActualDates = new Date(object.works[object.works.length - 1].actualDate).getTime() - actualStartTime
    const scaleActual = d3.time.scale()
        .domain([new Date(object.works[0].actualDate), new Date(object.works[object.works.length - 1].actualDate)])
        .range([0, oneYear / 365 * differenceActualDates / oneDay]);

    const axisActual = d3.svg.axis()
        .scale(scaleActual)
        .orient('bottom')
        .tickValues(actualDates)
        .tickFormat(d3.time.format('%d.%m.%y'));

    svg.append('g')
        .attr('transform', 'translate(' + oneYear / 365 * countDaysFromNewYearContract + ',' + 25 + ')')
        .call(axisContract)

    svg.append('g')
        .attr('transform', 'translate(' + oneYear / 365 * countDaysFromNewYearActual + ',' + 70 + ')')
        .call(axisActual)
}

function createDateFilter(parent) {
    const inputs = [];
    const wrapperDate = $('<div>').addClass('filter wrapperDate').appendTo(parent);
    for (let i = 0; i < 2; i++) {
        const input = $(`<input type='date'>`).addClass('inputDate').appendTo(wrapperDate);
        inputs.push(input);
    }
    inputs.forEach(input => {
        input.change(() => {
            const date = inputs.map(el => {
                return (new Date(el.val()))
            })
            inputs[1].attr('min', inputs[0].val())
            if (date[0].getTime() > date[1].getTime()) {
                inputs[1].attr('value', inputs[0].val())
                inputs[1].attr('min', inputs[0].val())

            }
        });

    })
}

function createDropdown(parent, name, objects) {
    const checkboxes = [];
    const dropdown = $('<div>').addClass('filter dropdown').appendTo(parent);
    const dropbtn = $('<div>')
        .addClass('dropbtn')
        .html(name)
        .appendTo(dropdown);
    const content = $('<div>').addClass('dropdown-content').appendTo(dropdown);
    objects.forEach((element) => {
        const label = $('<label>').html(element.name).appendTo(content);
        const checkbox = $(`<input type='checkbox'>`)
            .data('value', element.name)
            .prependTo(label);
        checkboxes.push(checkbox);

        checkbox.change(() => {
            const unchecked = [];
            checkboxes.forEach((el) => {
                if (!el.prop('checked'))
                    unchecked.push(el.data().value)
            })
            tables.forEach((table) => {
                if (unchecked.includes(table.data('object'))) {
                    table.addClass('hide')
                } else {
                    table.removeClass('hide')
                }
            })
        })
    })

    dropbtn.click(() => {
        content.toggleClass('show')
    })
}

function createButtonSave(parent) {
    const button = $('<button>')
        .html('ButtonSave')
        .addClass('filter buttonSave').appendTo(parent);

    button.click(() => {
        const doc = new jsPDF('l', 'mm', [297, 210]);
        const options = {
            background: 'white',
            //pagesplit: true  save to >1 page
        };
        doc.addHTML($(wrapper)[0], options, function () {
            doc.save('objects.pdf');
        });
    })
}