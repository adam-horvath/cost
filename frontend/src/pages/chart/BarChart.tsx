import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { compose } from 'redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { easeLinear, select } from 'd3';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';

import { BarChartAnimationLength, Colors } from 'common/Constants';
import { getMaxTextWidth, getMoneyString } from 'utils/util';
import './BarChart.scss';

export interface BarChartProps
  extends WithTranslation,
    ConnectedProps<typeof connector> {
  setSize: () => void;
  isLarge: boolean;
}

export interface DataPoint {
  label: string;
  value: number;
}

export const nonVisualizibleData = ['prevBalance', 'error', 'loading'];

class BarChart extends Component<BarChartProps> {
  domNode = null;
  height = 0;
  width = 0;
  data: Array<DataPoint> = [];
  selection: any;
  node: any;

  componentDidMount() {
    const values: Array<number> = [];
    const labels: Array<string> = [];
    const { chart, t } = this.props;
    for (let key in chart) {
      if (
        chart.hasOwnProperty(key) &&
        // @ts-ignore
        chart[key] &&
        !nonVisualizibleData.includes(key)
      ) {
        values.push(
          // @ts-ignore
          chart[key].length === 1
            ? // @ts-ignore
              chart[key][0].amount
            : // @ts-ignore
              chart[key].reduce((prev, next) => {
                return (
                  (prev.amount || prev.amount === 0 ? prev.amount : prev) +
                  next.amount
                );
              }, 0),
        );
        labels.push(t(`COMMON.CATEGORIES.${key}`));
      }
    }
    this.data = values.map((value, i) => {
      return { value, label: labels[i] };
    });
    window.addEventListener('resize', this.resize);
    setTimeout(this.draw, 500);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    this.props.setSize();
    this.draw();
  };

  draw = () => {
    const svgSelection: any = select('svg');
    if (
      svgSelection._groups &&
      svgSelection._groups[0] &&
      svgSelection._groups[0][0]
    ) {
      select('svg').remove();
    }
    this.selection = select(this.node);
    this.domNode = this.selection.node();
    const node = select(this.domNode);

    const margin = {
      top: 30,
      right: 20,
      bottom:
        getMaxTextWidth(
          this.data.map((d) => d.label),
          'normal 12px JmhTypewriter',
        ) + 10,
      left: 80,
    };
    let isHorizontalLabels = false;

    this.width = isNaN(parseInt(node.style('width'), 10))
      // @ts-ignore
      ? (node._groups && node._groups[0] && node._groups[0][0])
        // @ts-ignore
        ? node._groups[0][0].offsetWidth - margin.left - margin.right
        : this.props.isLarge
        ? window.innerWidth * 0.8 - margin.left - margin.right
        : Math.min(366, window.innerWidth - margin.left - margin.right)
      : parseInt(node.style('width'), 10) - margin.left - margin.right;

    const barPadding = 20;
    const barWidth = (this.width - barPadding) / this.data.length;

    if (margin.bottom < barWidth) {
      isHorizontalLabels = true;
      margin.bottom = 30;
    }

    this.height = (this.props.isLarge ? 500 : 300) - margin.top - margin.bottom;

    const x = scaleBand().rangeRound([0, this.width]).padding(0.1);
    const y = scaleLinear().rangeRound([this.height, 0]);

    const svg = this.selection.append('svg').attr('class', 'bar-chart');

    svg
      .attr('width', this.width + margin.left + margin.right)
      .attr('height', this.height + margin.top + margin.bottom);

    // axes' data
    x.domain(this.data.map((d) => d.label));
    y.domain([0, Math.max(...this.data.map((data) => Math.abs(data.value)))]);

    // the main group
    const g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // axis x
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('fill', Colors.costBlue)
      .style('stroke', 'none')
      .attr('class', 'label-text')
      .attr('dx', isHorizontalLabels ? 0 : '-.8em')
      .attr('dy', isHorizontalLabels ? '.9em' : '-.55em');

    // axis-x labels
    g.selectAll('.label-text')
      .nodes()
      .forEach((node: SVGTextContentElement) => {
        select(node).attr('transform', () =>
          isHorizontalLabels
            ? 'translate(' + node.getComputedTextLength() / 2 + ', 0)'
            : 'rotate(-90)',
        );
      });

    // axis-y
    g.append('g').attr('class', 'axis axis--y').call(axisLeft(y).ticks(5));

    // bars
    g.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .style('fill', (d: DataPoint) =>
        d.value >= 0
          ? d.label === 'Egyenleg'
            ? Colors.costGreen
            : Colors.costBlue
          : Colors.costRed,
      )
      .style('stroke', 'none')
      .attr('class', 'bar')
      .attr('width', barWidth - barPadding)
      .attr('y', this.height - 1)
      .attr(
        'transform',
        (d: DataPoint, i: number) =>
          'translate(' + [barWidth * i + barPadding, 0] + ')',
      )
      .transition()
      .duration(BarChartAnimationLength)
      .ease(easeLinear)
      .attr('y', (d: DataPoint) => y(Math.abs(d.value)))
      .attr('height', (d: DataPoint) => this.height - y(Math.abs(d.value)));

    setTimeout(() => {
      // amount-text
      g.selectAll('.amount-text')
        .data(this.data)
        .enter()
        .append('text')
        .text((d: DataPoint) => getMoneyString(d.value))
        .style('fill', (d: DataPoint) =>
          d.value >= 0
            ? d.label === 'Egyenleg'
              ? Colors.costGreen
              : Colors.costBlue
            : Colors.costRed,
        )
        .attr('class', 'amount-text')
        .attr('x', (d: DataPoint, i: number) => i * barWidth + barPadding)
        .attr('y', (d: DataPoint) => y(Math.abs(d.value)) - 5)
        .style('opacity', 0)
        .transition()
        .duration(200)
        .ease(easeLinear)
        .style('opacity', 1);

      // centering amount-text
      g.selectAll('.amount-text')
        .nodes()
        .forEach((node: SVGTextContentElement) => {
          select(node).attr(
            'transform',
            () =>
              'translate(' +
              (barWidth - barPadding - node.getComputedTextLength()) / 2 +
              ', 0)',
          );
        });
    }, BarChartAnimationLength - 100);
  };

  render() {
    return (
      <div
        className={`bar-chart-container ${this.props.isLarge ? '' : 'small'}`}
        ref={(r) => (this.node = r)}
      />
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    chart: state.chart,
  };
};

const connector = connect(mapStateToProps, {});

export default compose(connector)(withTranslation()(BarChart));
