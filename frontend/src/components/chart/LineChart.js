import React, { Component } from "react";
import * as d3 from "d3";
import { scaleBand, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import "./LineChart.scss";
import Colors from "../../colors/Colors";
import Util from "../../common/Util";
import Constants from "../../common/Constants";

class LineChart extends Component {
    domNode = null;
    height = 0;
    width = 0;
    legends = [];
    labels = [];
    tooltipWidth = 150;
    tooltipHeight = 40;
    margin = {
        top: 60,
        right: 20,
        bottom: 30,
        left: 80
    };

    componentDidMount() {
        for (let key in this.props.chart) {
            if (this.props.chart.hasOwnProperty(key)) {
                this.legends.push(Util.getHungarianCategory(key));
                if (!this.labels.length) {
                    this.props.chart[key].forEach(d =>
                        this.labels.push(Util.getMonthLabel(d.year, d.month))
                    );
                }
            }
        }
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
        if (d3.select("svg")._groups[0][0]) {
            d3.select("svg").remove();
        }
        this.selection = d3.select(this.node);
        this.domNode = this.selection.node();
        let isHorizontalLabels = false;
        this.width =
            parseInt(window.getComputedStyle(document.getElementsByClassName('modal-dialog')[0]).width, 10) -
            this.margin.left -
            this.margin.right;
        this.margin.bottom =
            Util.getMaxTextWidth(this.labels, "normal 12px JmhTypewriter") + 10;
        if (this.margin.bottom < this.width / this.labels.length) {
            isHorizontalLabels = true;
            this.margin.bottom = 30;
        }
        this.height =
            (this.props.isLarge ? 500 : 300) -
            this.margin.top -
            this.margin.bottom;

        const xScale = scaleBand()
            .domain(this.labels)
            .rangeRound([0, this.width]);

        let minValue = 0;
        let maxValue = 0;
        for (let key in this.props.chart) {
            if (this.props.chart.hasOwnProperty(key)) {
                minValue = Math.min(
                    minValue,
                    ...this.props.chart[key].map(
                        d =>
                            this.props.isSum && key === "BALANCE"
                                ? d.sumAmount
                                : d.amount
                    )
                );
                maxValue = Math.max(
                    maxValue,
                    ...this.props.chart[key].map(
                        d =>
                            this.props.isSum && key === "BALANCE"
                                ? d.sumAmount
                                : d.amount
                    )
                );
            }
        }
        const yScale = scaleLinear()
            .domain([minValue, maxValue])
            .rangeRound([this.height, 0]);

        const mapX = index => (index + 0.5) * this.width / this.labels.length;
        const mapY = value =>
            this.height -
            this.height * (value - minValue) / (maxValue - minValue);

        const svg = this.selection.append("svg").attr("class", "line-chart");

        // outer-g group is for legend
        svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class", "outer-g");

        // draw the legend
        let shift = 0;
        for (let key in this.props.chart) {
            if (this.props.chart.hasOwnProperty(key)) {
                d3
                    .select(".outer-g")
                    .append("circle")
                    .attr("class", "legend-circle " + key.toLowerCase())
                    .attr("stroke", this.getColor(key))
                    .attr("stroke-width", 3)
                    .attr("fill", Colors.lightGray)
                    .attr("r", 3)
                    .attr("transform", "translate(" + shift + ", 30)");
                shift += 10;
                d3
                    .select(".outer-g")
                    .append("text")
                    .text(
                        Util.getHungarianCategory(key) +
                            (this.props.isSum && key === "BALANCE"
                                ? " (\u03A3)"
                                : "")
                    )
                    .attr("transform", "translate(" + shift + ", 34)")
                    .attr("class", "legend-text")
                    .style("fill", this.getColor(key));
                shift +=
                    Util.getTextWidth(
                        Util.getHungarianCategory(key),
                        "normal 12px VarelaRound"
                    ) + (this.props.isSum && key === "BALANCE" ? 60 : 40);
            }
        }

        // position legend group to center
        d3
            .select(".outer-g")
            .attr(
                "transform",
                "translate(" +
                    (this.margin.left +
                        (this.width - this.margin.right - shift) / 2) +
                    ", 0)"
            );

        // the main chart group
        const g = svg
            .append("g")
            .attr("class", "chart-g")
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );

        // draw axis X with labels
        g
            .append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .style("fill", Colors.costBlue)
            .style("stroke", "none")
            .attr("class", "label-text")
            .attr("dx", isHorizontalLabels ? 0 : "-.8em")
            .attr("dy", isHorizontalLabels ? ".9em" : "-.55em");

        // position x-labels in an intelligent way (rotate or shift)
        d3
            .selectAll(".label-text")
            .nodes()
            .forEach(node =>
                d3
                    .select(node)
                    .attr(
                        "transform",
                        isHorizontalLabels
                            ? "translate(" +
                              node.getComputedTextLength() / 2 +
                              ", 0)"
                            : "rotate(-90)"
                    )
            );

        // draw axis Y
        g
            .append("g")
            .attr("class", "axis axis--y")
            .call(axisLeft(yScale).ticks(5));

        // line drawer function
        const line = d3
            .line()
            .x((d, i) => mapX(i))
            .y(
                d =>
                    this.props.isSum && d.sumAmount
                        ? mapY(d.sumAmount)
                        : mapY(d.amount)
            )
            .curve(d3.curveMonotoneX);

        // draw each line
        for (let key in this.props.chart) {
            if (this.props.chart.hasOwnProperty(key)) {
                g
                    .append("path")
                    .attr("class", "line")
                    .attr("d", line(this.props.chart[key]))
                    .attr("stroke", this.getColor(key))
                    .attr("stroke-width", 3)
                    .attr("fill", "none")
                    .call(this.transition);
            }
        }

        // draw dots at each data point
        for (let key in this.props.chart) {
            if (this.props.chart.hasOwnProperty(key)) {
                setTimeout(() => {
                    const that = this;
                    const selection = g
                        .selectAll(".dot." + key.toLowerCase())
                        .data(this.props.chart[key])
                        .enter()
                        .append("circle");
                    selection
                        .on("mouseover", function(event, d) {
                            const nodes = selection.nodes();
                            const i = nodes.indexOf(this);
                            that.onMouseOver(d, i, nodes);
                        })
                        .on("mouseout", function(event, d) {
                            const nodes = selection.nodes();
                            const i = nodes.indexOf(this);
                            that.onMouseOut(d, i, nodes);
                        })
                        .attr("class", "dot " + key.toLowerCase())
                        .attr("cx", (d, i) => mapX(i))
                        .attr(
                            "cy",
                            d =>
                                this.props.isSum && key === "BALANCE"
                                    ? mapY(d.sumAmount)
                                    : mapY(d.amount)
                        )
                        .attr("stroke", this.getColor(key))
                        .attr("stroke-width", 3)
                        .attr("fill", Colors.lightGray)
                        .attr("r", 3)
                        .style("opacity", 0)
                        .transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .style("opacity", 1);
                }, Constants.LINE_CHART_ANIMATION_LENGTH - 100);
            }
        }

        // the tooltip
        setTimeout(() => {
            d3
                .select(".chart-g")
                .append("rect")
                .attr("width", this.tooltipWidth)
                .attr("height", this.tooltipHeight)
                .attr("class", "cost-tooltip")
                .attr("rx", 20)
                .attr("ry", 20)
                .style("fill", Colors.lightGray)
                .style("opacity", 0.85)
                .style("stroke-width", 3)
                .style("display", "none");
            // the tooltip text
            d3
                .select(".chart-g")
                .append("text")
                .attr("class", "tooltip-text")
                .style("display", "none");
        }, Constants.LINE_CHART_ANIMATION_LENGTH + 500);
    };

    onMouseOver(d, i, nodes) {
        const circle = d3.select(nodes[i]);
        const tooltipText =
            circle.classed("balance") && this.props.isSum
                ? Util.getMoneyString(d.sumAmount)
                : Util.getMoneyString(d.amount);
        circle.attr("r", 5);
        const translateX = Math.min(
            this.width - this.tooltipWidth + this.margin.right - 3,
            circle.attr("cx") - this.tooltipWidth / 2
        );
        d3
            .select(".cost-tooltip")
            .attr(
                "transform",
                "translate(" +
                    translateX +
                    ", " +
                    (circle.attr("cy") - this.tooltipHeight - 5) +
                    ")"
            )
            .style("stroke", circle.attr("stroke"))
            .style("display", "block");
        d3
            .select(".tooltip-text")
            .text(tooltipText)
            .attr(
                "transform",
                "translate(" +
                    (translateX +
                        (this.tooltipWidth -
                            Util.getTextWidth(
                                tooltipText,
                                "normal 16px VarelaRound"
                            )) /
                            2) +
                    ", " +
                    (circle.attr("cy") - this.tooltipHeight / 2 + 2) +
                    ")"
            )
            .attr("fill", circle.attr("stroke"))
            .style("display", "block");
    }

    onMouseOut = (d, i, nodes) => {
        d3.select(nodes[i]).attr("r", 3);
        d3.select(".cost-tooltip").style("display", "none");
        d3.select(".tooltip-text").style("display", "none");
    };

    transition = path => {
        path
            .transition()
            .duration(Constants.LINE_CHART_ANIMATION_LENGTH)
            .attrTween("stroke-dasharray", this.tweenDash);
    };

    tweenDash() {
        const l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return t => i(t);
    }

    getColor = key =>
        key === "BALANCE"
            ? Colors.costBlue
            : key === "COST"
                ? Colors.costRed
                : key === "INCOME"
                    ? Colors.costGreen
                    : Constants.LINE_COLORS[
                          this.legends.indexOf(Util.getHungarianCategory(key)) %
                              Constants.LINE_COLORS.length
                      ];

    render() {
        return (
            <div className="line-chart-container" ref={r => (this.node = r)} />
        );
    }
}

LineChart.propTypes = {
    isLarge: PropTypes.bool,
    setSize: PropTypes.func,
    isSum: PropTypes.bool,
    chart: PropTypes.object
};

const mapStateToProps = state => {
    const { chart } = state;
    return { chart };
};

export default connect(mapStateToProps)(LineChart);
