Chart.defaults.global.legend.labels.usePointStyle = true;

var startColor = "#00FFF0";
var endColor = "#000AFF";
var fontcolor = "#000000";
var linecolor = "#DEDEDE";

var options_pie = {
        legend: {
            display: true,
            position: 'bottom',
            shape: "circle",
            align: 'center',
            labels: {
                fontColor: fontcolor
            }
        },
        title: {
            display: false,
            text: 'Bar Chart'
        },
    }
var options_doughnut =  {
        legend: {
            display: true,
            position: 'bottom',
            shape: "circle",
            align: 'center',
            labels: {
                fontColor: fontcolor
            },
        },
        title: {
            display: false,
            text: 'Bar Chart'
        },
        fontColor: fontcolor,
    }
var options_bar = {
    legend: {
        display: false
    },
    indexAxis: 'x',
    title: {
        display: false,
        text: 'Bar Chart'
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true,
                maxSteps: 10,
                fontColor: fontcolor,
                format: {
                    style: 'percent'
                }
            },
            gridLines: {
                color: linecolor,
                zeroLineColor: linecolor,
            },
        }],
        xAxes: [{
            gridLines: {
                color: linecolor,
                zeroLineColor: linecolor,
                display: false,
            },
            ticks: {
                        fontColor: fontcolor,
                        format: {
                    style: 'percent'
                }
                    }
      }],
    },
}
var options_horizontalBar = {
        legend: {
            display: false,
            labels: {
                fontColor: fontcolor
            }
        },
        title: {
            display: false,
        },
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: fontcolor,
                },
                gridLines: {
                    color: linecolor,
                    zeroLineColor: linecolor,
                },
            }],
            yAxes: [{
                gridLines: {
                    color: linecolor,
                    zeroLineColor: linecolor,
                    display: false,
                },
                ticks: {
                        beginAtZero: true,
                        fontColor: fontcolor,
                    }
            }],
        },
    }
var options_line = {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontColor: fontcolor
            }
        },
        indexAxis: 'x',
        title: {
            display: false,
            text: 'Bar Chart'
        },
        fontColor: fontcolor,
    gridLines: {
            color: linecolor
    },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: fontcolor
                },
                gridLines: {
                    color: linecolor,
                    zeroLineColor: linecolor,
                }
            }],
            xAxes: [{
                gridLines: {
                    color: linecolor,
                    zeroLineColor: linecolor,
                },
                ticks: {
                        fontColor: fontcolor,
                    }
            }],
        }
    }
function create_options_bubble(style) {
    var options_bubble = {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontColor: fontcolor
            }
        },
        aspectRatio: 2.5,
        plugins: {
            title: {
                display: false,
                font: {size: 16, weight: 'bold'},
            },
        },
        title: {
            display:false
        },
       scales: {
        yAxes: [{
            gridLines: {
                color: linecolor,
                zeroLineColor: linecolor,
            },
            ticks: {
                        fontColor: fontcolor,
                    }
        }],
        xAxes: [{
            gridLines: {
                color: linecolor,
                zeroLineColor: linecolor,
            },
            ticks: {
                        fontColor: fontcolor,
                        callback: function(value, index, values) {
                        if (style == 'time') {
                            var date = new Date(value);
                            return date.toLocaleTimeString('it-IT');
                        }
                        if (style == 'date') {
                            var date = new Date(value);
                            return date.toLocaleDateString('en-GB');
                        }
                        if (style == 'datetime') {
                            var date = new Date(value);
                            return date.toLocaleString('en-GB');
                        }
                        else {
                            return value;
                        }
                        }


                    }
      }],
    },
    }
    return options_bubble;
}

function hex(c) {
  var s = "0123456789abcdef";
  var i = parseInt(c);

  if (i == 0 || isNaN(c))
    return "00";

  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}
function convertToHex(rgb) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}
function trim(s) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s
}
function convertToRGB(hex) {
  var color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
}
function generateColor(colorStart, colorEnd, colorCount) {
  var start = convertToRGB(colorStart);
  var end = convertToRGB(colorEnd);
  var len = colorCount;
  var alpha = 0.0;
  var saida = [];
  saida.push(colorEnd);
  for (i = 0; i < len - 2; i++) {
    var c = [];
    alpha += (1.0 / len);
    c[0] = start[0] * alpha + (1 - alpha) * end[0];
    c[1] = start[1] * alpha + (1 - alpha) * end[1];
    c[2] = start[2] * alpha + (1 - alpha) * end[2];
    saida.push('#' + convertToHex(c).toString());
  }
  saida.push(colorStart);
  return saida;
}
var colors100 = generateColor(endColor, startColor, 100);

var options_array = [{id:'pie',options: options_pie},{id:'doughnut',options: options_doughnut},
{id:'bar',options: options_bar}, {id:'horizontalBar',options: options_horizontalBar}, {id:'line',options: options_line}];

class Diagram {
    id
    type
    headers
    values
    values_x
    x_style
    chart

    constructor(id, type, headers, values, values_x = [], x_style = '') {
        this.id = id;
        this.type = type;
        this.headers = headers;
        this.values = values;
        this.values_x = values_x;
        this.x_style = x_style;
        this.analyse_data_line();
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getHeaders() {
        return this.headers;
    }

    getValues() {
        return this.values;
    }

    getValues_x() {
        return this.values_x;
    }

    analyse_data_line() {

        if (this.type == 'line' || this.type == 'area') {

            var values_x = this.values_x;
            var values = [];
            for (var i = 0; i < this.values.length; i++) {
                var values_t = [];

                for (var j = 0; j < values_x.length; j++) {

                    var value = 'null';
                    for (var k = 0; k < this.values[i].length; k++) {
                        if (values_x[j] == this.values[i][k][0]) {
                        value = this.values[i][k][1];
                        break;
                        }

                    }

                    values_t.push(value);

                }

                for (var k = 0; k < values_t.length; k++) {
                        if (values_t[k] == 'null') {
                            if (k - 1 > -1) {
                                var flag = 0;
                                for (var t = k + 1; t < values_t.length; t++) {
                                    if (values_t[t] != 'null') {
                                        flag = 1;
                                        break;
                                    }
                                }
                                if (flag == 1) {
                                    if (values_t[k - 1] != 'null') {
                                        var r = (values_t[t] - values_t[k - 1]) / (t - (k - 1));
                                        values_t[k] = values_t[k - 1] + r;

                                    }



                                }


                            }

                        }
                    }



                values.push(values_t);

            }
            this.values = values;
        }
    }

    create_datasets(type) {
        var backgroundColors = generateColor(endColor, startColor, this.headers.length);
        var fill = false;
        if (this.type == 'area') {
            fill = true;
        }
        var datasets = [];
        var labels = this.headers;
        if (type == 'pie' || type == 'doughnut' || type == 'bar' || type == 'horizontalBar') {
         datasets = [{
            label: {
                display: true
            },
            data: this.values,
            backgroundColor: backgroundColors,
            borderWidth: 0,
            borderColor: backgroundColors
        }];
    }
        else if (type == 'line') {
        var radius = 3;
        if (fill == true) {
            radius = 0;
        }
        for (let i = 0; i < this.values.length; i++) {

            datasets.push({
            label: this.headers[i],
            backgroundColor: backgroundColors[i],
            data: this.values[i],
            pointBackgroundColor: backgroundColors[i],
            borderColor: backgroundColors[i],
            fill: fill,
            borderWidth: 0,
            pointRadius: radius

        });
        }
    }
        else if (type == 'bubble') {
        for (let i = 0; i < this.values.length; i++) {
            var data = [];
            for (let j = 0; j < this.values[i].length; j++) {
                data.push({x: this.values[i][j][0], y:this.values[i][j][1], r:this.values[i][j][2]});
            }
            datasets.push({
            label: this.headers[i],
            backgroundColor: backgroundColors[i],
            data: data,
            borderColor: backgroundColors[i],
            borderWidth: 0
        });
        }
        }
        return datasets;
    }
    draw() {

        var element = document.getElementById(this.id);
        var type = this.type;
        if (this.type == 'area') {
            type = 'line';
        }
        var labels = this.headers;
        if (type == 'line') {
            labels = this.values_x;

        }
        var datasets = this.create_datasets(type);
        if (this.type == 'bubble') {
            var options = create_options_bubble(this.x_style);
        }
        else {
            var result_options = options_array.find(obj => obj.id === type);
            var options = result_options.options;
        }
        this.chart = new Chart(element, {
        'type': type,
        'data': {
            labels: labels,
            datasets: datasets
        },
        options: options
        });
    }
    update(values, values_x) {
        this.values = values;
        this.analyse_data_line();
        this.values_x = values_x;
        var element = document.getElementById(this.id);
        var type = this.type;
        var fill = false;
        if (this.type == 'area') {
            var type = 'line';
            fill = true;
        }
        var datasets = this.create_datasets(type);
        this.chart.data.datasets = datasets;
        this.chart.update();
    }

    add(header, value) {
        this.headers.push(header);
        this.values.push(value);
        this.analyse_data_line();
        this.chart.destroy();
        this.draw();
    }

    pop(index) {
        this.headers.splice(index - 1, 1);
        this.values.splice(index - 1, 1);
        this.chart.destroy();
        this.draw();
    }

    remove() {
        var element = document.getElementById(this.id);
        element.remove();
    }
}

class ProgressBar {
    id
    type
    headers
    values

    constructor(id, type, headers, values) {
        this.id = id;
        this.type = type;
        this.headers = headers;
        this.values = values;
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getHeaders() {
        return this.headers;
    }

    getValues() {
        return this.values;
    }

    draw() {
        var element = document.getElementById(this.id);
        var chartContainer = element;
        var headers = this.headers;
        var values = this.values;
        this.headers = [];
        this.values = [];
        if (this.type == 'bar') {
              var barChart = $('<ul/>', { class: 'bar-chart' });
              barChart.appendTo(chartContainer);
              for (var i = 0; i < headers.length; i++){
                  this.add(headers[i], values[i])
              }
           }
        else if (this.type == 'pie') {

            for (var i = 0; i < headers.length; i++) {
                this.add(headers[i], values[i]);
            }

        }

    }

    update(values) {
        this.values = values;
        var element = document.getElementById(this.id);
        element.innerHTML = '';
        this.draw();
    }

    remove() {
        var element = document.getElementById(this.id);
        element.remove();
    }

    add(header, value) {
        this.headers.push(header);
        this.values.push(value);
        var element = document.getElementById(this.id);

        var i = this.headers.length - 1;

        if (this.type == 'bar') {

              var barChart = $('<ul/>', { class: 'bar-chart' });
              barChart.appendTo(element);
              var chartAnswer = $('<li/>', { class: 'answer-' + i,  style: "max-width:400px"}),
              answerLabel = $('<span/>', { class: 'label', text: this.headers[i], }),
              percentageValue = this.values[i].toString(),
              answerPercentage = $('<span/>', { class: 'percentage', text: percentageValue.replace('.', ',') + '%',  }),
              barTrack = $('<span/>', { class: 'bar-track',  }),
              bar = $('<span />', { class: 'bar', style: 'width: ' + percentageValue + '%; background-color: ' + colors100[this.values[i]],  }, );
              chartAnswer.appendTo(barChart);
              answerLabel.appendTo(chartAnswer);
              answerPercentage.appendTo(chartAnswer);
              barTrack.appendTo(chartAnswer);
              bar.appendTo(barTrack);
              }

        else {

              var Wrapper = $('<div/>', { class: 'wrapper' });
                var CardBox = $('<div/>', { class: 'card-box' });

                var color = colors100[this.values[i]];
                var val = this.values[i] * 360 / 100;

                if (val < 180) {

                    var CircleBox = $('<div/>', { class: 'circle-box', style: "background: " + color +
                    "; background-image: linear-gradient(-90deg, transparent 50%, " + linecolor +
                    " 50%), linear-gradient(" + (-90 + val).toString() + "deg, " + linecolor +
                    " 50%, transparent 50%);"});
                }
                else {
                    var CircleBox = $('<div/>', { class: 'circle-box', style: "background: " + linecolor +
                    "; background-image: linear-gradient(90deg, transparent 50%, " + color +
                    " 50%), linear-gradient(" + (-90 + val - 180).toString() + "deg, " + color +
                    " 50%, transparent 50%);"});
                }
                var Bar = $('<div/>', { class: 'bar' });
                var ProgressBox = $('<div/>', { class: 'progress-box' });
                var TextBox = $('<div/>', { text: this.headers[i], class: 'text-box' });
                var Span = $('<span/>', { text: (this.values[i].toString()).replace('.', ',') + '%',  });
                Wrapper.appendTo(element);
                CardBox.appendTo(Wrapper);
                CircleBox.appendTo(CardBox);
                TextBox.appendTo(CardBox);
                Bar.appendTo(CircleBox);
                ProgressBox.appendTo(CircleBox);
                Span.appendTo(ProgressBox);


        }



    }

    pop(index) {
        var element = document.getElementById(this.id);
        var childs = element.childNodes;
        if (this.type == 'pie') {
            childs[index - 1].remove();
        }
        else {
            childs[index].remove();
        }
    }

}

class RangeSlider {
    id
    type
    header
    value
    minValue
    maxValue

    constructor(id, type, header, value, minValue, maxValue) {
        this.id = id;
        this.type = type;
        this.header = header;
        this.value = value;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getValue() {
        var element = document.getElementById(this.id);
        return element.childNodes[1].value;
    }

    getMinValue() {
        return this.minValue;
    }

    getMaxValue() {
        return this.maxValue;
    }

    draw() {
    if (this.type = 'bar') {
        var element = document.getElementById(this.id);
        var Span = $('<span/>', { class: 'spanText', text: this.header});
        var Input = $('<input/>', { class: 'myslider', type: "range", min: this.minValue, max: this.maxValue, value: this.value });
        var Value = $('<span/>', { class: 'spanValue', text: this.value});
        Span.appendTo(element);
        Input.appendTo(element);
        Value.appendTo(element);
        }
    }


}

const tables = document.querySelectorAll(".sortableTable");
for (i = 0; i < tables.length; i++) {
    const table = tables[i];
    const th = table.querySelectorAll("th");
    let tbody = table.querySelector("tbody");
    let rows = [...tbody.rows];
    th.forEach((header) => {
    header.addEventListener("click", function () {
    let columnIndex = header.cellIndex;
    let sortDirection =
      header.getAttribute("data-sort-direction") === "asc" ? "desc" : "asc";
    header.setAttribute("data-sort-direction", sortDirection);
    rows.sort((a, b) => {
      let aValue = a.cells[columnIndex].textContent;
      let bValue = b.cells[columnIndex].textContent;

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return bValue > aValue ? 1 : -1;
      }
    });
    tbody.remove();
    tbody = document.createElement("tbody");
    rows.forEach((row) => tbody.appendChild(row));
    table.appendChild(tbody);
  });
});
}

const rangeSliders = document.querySelectorAll(".rangeSlider");
for (i = 0; i < rangeSliders.length; i++) {
    rangeSliders[i].oninput = function () {
        let output = rangeSliders[i].childNodes[2];
        output.innerHTML = rangeSliders[i].childNodes[1].value;
    }
}

class HeatMap {
    id
    data
    chart

    constructor(id, data) {
        this.id = id;
        this.data = this.generate_data(data);
        this.chart = anychart.heatMap(this.data);
    }

    getId() {
        return this.id;
    }

    getData() {
        return this.data;
    }

    generate_data(data) {
        var arr = [];
        for (i = 0; i < data.length; i++) {
            arr.push({x: data[i][0], y: data[i][1], heat: data[i][2]});
        }
        return arr;
    }

    update_data(data) {
        var arr = [];
        for (i = 0; i < data.length; i++) {
            arr.push({x: this.data[i].x, y: this.data[i].y, heat: data[i]});
        }
        return arr;
    }

    draw() {

        var id = this.id;
        var data = this.data;
        var chart = this.chart;

        var colorScale = anychart.scales.ordinalColor();
        var customColorScale = anychart.scales.linearColor();
        customColorScale.colors([startColor, endColor]);
        chart.colorScale(customColorScale);

        var credits = chart.credits();
        credits.enabled(false);

        chart
          .hovered()
          .fill(function () {
            return anychart.color.darken(this.sourceColor, 0.25);
          });
        chart
          .selected()
          .fill(function () {
            return anychart.color.darken(this.sourceColor, 0.25);
          });
        chart.xAxis().stroke(null);
        chart.yAxis().stroke(null);
        chart.yAxis().labels().padding([0, 10, 0, 0]);
        chart.xAxis().labels().padding([0, 0, 10, 0]);
        chart.tooltip().title().useHtml(true);

        chart
          .tooltip()
          .useHtml(true)
          .titleFormat(function () {
            return this.heat;
          })
          .format(function () {
            return (
              '<span style="color: #CECECE"></span>' +
              this.x +
              "<br/>" +
              '<span style="color: #CECECE"></span>' +
              this.y
            );
          });

        chart
          .title()
          .enabled(true)
          .text("")
          .padding([0, 0, 20, 0]);

        chart.container(id);
        chart.draw();

    }

    remove() {
        var element = document.getElementById(this.id);
        element.remove();
    }

    update(data) {
        this.data = this.update_data(data);
        this.chart.data(this.data);
    }


}

