import React, { Component } from "react";
import { select, easeLinear } from "d3";
import { scaleBand, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ReactResizeDetector from "react-resize-detector";
import "./BarChart.scss";
import Colors from "../../colors/Colors";
import Util from "../../common/Util";
import Constants from "../../common/Constants";

class BarChart extends Component {
  domNode = null;
  height = 0;
  width = 0;
  data = [];

  componentDidMount() {
    const values = [];
    const labels = [];
    for (let key in this.props.chart) {
      if (this.props.chart.hasOwnProperty(key)) {
        values.push(
          this.props.chart[key].length === 1
            ? this.props.chart[key][0].amount
            : this.props.chart[key].reduce((prev, next) => {
                return (
                  (prev.amount || prev.amount === 0 ? prev.amount : prev) +
                  next.amount
                );
              })
        );
        labels.push(Util.getHungarianCategory(key));
      }
    }
    this.data = values.map((value, i) => {
      return { value, label: labels[i] };
    });
    window.addEventListener("resize", this.resize);
    this.draw();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }

  resize = () => {
    this.props.setSize();
    this.draw();
  };

  draw = () => {
    if (select("svg")._groups[0][0]) {
      select("svg").remove();
    }
    this.selection = select(this.node);
    this.domNode = this.selection.node();
    const node = select(this.domNode);

    const margin = {
      top: 30,
      right: 20,
      bottom:
        Util.getMaxTextWidth(
          this.data.map(d => d.label),
          "normal 12px JmhTypewriter"
        ) + 10,
      left: 80
    };
    let isHorizontalLabels = false;

    this.width = parseInt(node.style("width"), 10) - margin.left - margin.right;

    const barPadding = 20;
    const barWidth = (this.width - barPadding) / this.data.length;

    if (margin.bottom < barWidth) {
      isHorizontalLabels = true;
      margin.bottom = 30;
    }

    this.height = (this.props.isLarge ? 500 : 300) - margin.top - margin.bottom;

    const x = scaleBand()
      .rangeRound([0, this.width])
      .padding(0.1);
    const y = scaleLinear().rangeRound([this.height, 0]);

    const svg = this.selection.append("svg").attr("class", "bar-chart");

    svg
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom);

    // axes' data
    x.domain(this.data.map(d => d.label));
    y.domain([0, Math.max(...this.data.map(data => Math.abs(data.value)))]);

    // the main group
    const g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // axis x
    g
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")")
      .call(axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("fill", Colors.costBlue)
      .style("stroke", "none")
      .attr("class", "label-text")
      .attr("dx", isHorizontalLabels ? 0 : "-.8em")
      .attr("dy", isHorizontalLabels ? ".9em" : "-.55em");

    // axis-x labels
    g
      .selectAll(".label-text")
      .nodes()
      .forEach(node => {
        select(node).attr(
          "transform",
          () =>
            isHorizontalLabels
              ? "translate(" + node.getComputedTextLength() / 2 + ", 0)"
              : "rotate(-90)"
        );
      });

    // axis-y
    g
      .append("g")
      .attr("class", "axis axis--y")
      .call(axisLeft(y).ticks(5));

    // bars
    g
      .selectAll(".bar")
      .data(this.data)
      .enter()
      .append("rect")
      .style(
        "fill",
        d =>
          d.value >= 0
            ? d.label === "Egyenleg"
              ? Colors.costGreen
              : Colors.costBlue
            : Colors.costRed
      )
      .style("stroke", "none")
      .attr("class", "bar")
      .attr("width", barWidth - barPadding)
      .attr("y", this.height - 1)
      .attr(
        "transform",
        (d, i) => "translate(" + [barWidth * i + barPadding, 0] + ")"
      )
      .transition()
      .duration(Constants.BAR_CHART_ANIMATION_LENGTH)
      .ease(easeLinear)
      .attr("y", d => y(Math.abs(d.value)))
      .attr("height", d => this.height - y(Math.abs(d.value)));

    setTimeout(() => {
      // amount-text
      g
        .selectAll(".amount-text")
        .data(this.data)
        .enter()
        .append("text")
        .text(d => Util.getMoneyString(d.value))
        .style(
          "fill",
          d =>
            d.value >= 0
              ? d.label === "Egyenleg"
                ? Colors.costGreen
                : Colors.costBlue
              : Colors.costRed
        )
        .attr("class", "amount-text")
        .attr("x", (d, i) => i * barWidth + barPadding)
        .attr("y", d => y(Math.abs(d.value)) - 5)
        .style("opacity", 0)
        .transition()
        .duration(200)
        .ease(easeLinear)
        .style("opacity", 1);

      // centering amount-text
      g
        .selectAll(".amount-text")
        .nodes()
        .forEach(node => {
          select(node).attr(
            "transform",
            () =>
              "translate(" +
              (barWidth - barPadding - node.getComputedTextLength()) / 2 +
              ", 0)"
          );
        });
    }, Constants.BAR_CHART_ANIMATION_LENGTH - 100);
  };

  render() {
    return (
      <ReactResizeDetector
        handleWidth
        onResize={this.resize}
        render={() => (
          <div
            className={`bar-chart-container ${
              this.props.isLarge ? "" : "small"
            }`}
            ref={r => (this.node = r)}
          />
        )}
      />
    );
  }
}

BarChart.propTypes = {
  isLarge: PropTypes.bool,
  setSize: PropTypes.func,
  chart: PropTypes.object
};

const mapStateToProps = state => {
  const { chart } = state;
  return { chart };
};

export default connect(mapStateToProps)(BarChart);
