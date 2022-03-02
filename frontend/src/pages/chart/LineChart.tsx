import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { compose } from 'redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import {
  curveMonotoneX,
  line as d3line,
  select,
  selectAll,
  easeLinear,
  interpolateString,
} from 'd3';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';

import {
  getMaxTextWidth,
  getMoneyString,
  getMonthLabel,
  getTextWidth,
} from 'utils/util';
import { Colors, LineChartAnimationLength, LineColors } from 'common/Constants';
import { ChartKey, MappedDataPoint } from 'models/chart.model';
import './LineChart.scss';

export interface LineChartProps
  extends WithTranslation,
    ConnectedProps<typeof connector> {
  setSize: () => void;
  isLarge: boolean;
  isSum: boolean;
}

class LineChart extends Component<LineChartProps> {
  domNode = null;
  height = 0;
  width = 0;
  legends: Array<string> = [];
  labels: Array<string> = [];
  selection: any;
  tooltipWidth = 150;
  tooltipHeight = 40;
  margin = {
    top: 60,
    right: 20,
    bottom: 30,
    left: 80,
  };
  node: any;

  componentDidMount() {
    const { t, chart } = this.props;
    for (let key in chart) {
      if (
        chart.hasOwnProperty(key) &&
        key !== 'prevBalance' &&
        chart[key as keyof typeof chart]
      ) {
        this.legends.push(t(`COMMON.CATEGORIES.${key}`));
        if (!this.labels.length) {
          (chart[key as keyof typeof chart] as MappedDataPoint[]).forEach(
            (d: MappedDataPoint) => {
              this.labels.push(getMonthLabel(d.year, d.month));
            },
          );
        }
      }
    }
    window.addEventListener('resize', this.resize);
    this.draw();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    this.props.setSize();
    this.draw();
  };

  draw = () => {
    const { chart, isSum, t } = this.props;
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
    let isHorizontalLabels = false;
    this.width =
      parseInt(
        window.getComputedStyle(
          document.getElementsByClassName('modal-dialog')[0],
        ).width,
        10,
      ) -
      this.margin.left -
      this.margin.right;
    this.margin.bottom =
      getMaxTextWidth(this.labels, 'normal 12px JmhTypewriter') + 10;
    if (this.margin.bottom < this.width / this.labels.length) {
      isHorizontalLabels = true;
      this.margin.bottom = 30;
    }
    this.height =
      (this.props.isLarge ? 500 : 300) - this.margin.top - this.margin.bottom;

    const xScale = scaleBand().domain(this.labels).rangeRound([0, this.width]);

    let minValue = 0;
    let maxValue = 0;
    for (let key in chart) {
      if (
        chart.hasOwnProperty(key) &&
        key !== ChartKey.PrevBalance &&
        chart[key as keyof typeof chart]
      ) {
        minValue = Math.min(
          minValue,
          ...(chart[key as keyof typeof chart] as MappedDataPoint[])?.map(
            (d: MappedDataPoint) => {
              return isSum && key === 'BALANCE' ? d.sumAmount || 0 : d.amount;
            },
          ),
        );
        maxValue = Math.max(
          maxValue,
          ...(chart[key as keyof typeof chart] as MappedDataPoint[]).map(
            (d: MappedDataPoint) => {
              return isSum && key === 'BALANCE' ? d.sumAmount || 0 : d.amount;
            },
          ),
        );
      }
    }
    const yScale = scaleLinear()
      .domain([minValue, maxValue])
      .rangeRound([this.height, 0]);

    const mapX = (index: number) => {
      return ((index + 0.5) * this.width) / this.labels.length;
    };

    const mapY = (value: number) => {
      return (
        this.height - (this.height * (value - minValue)) / (maxValue - minValue)
      );
    };

    const svg = this.selection.append('svg').attr('class', 'line-chart');

    // outer-g group is for legend
    svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('class', 'outer-g');

    // draw the legend
    let shift = 0;
    for (let key in chart) {
      if (
        chart.hasOwnProperty(key) &&
        key !== 'prevBalance' &&
        chart[key as keyof typeof chart]
      ) {
        select('.outer-g')
          .append('circle')
          .attr('class', 'legend-circle ' + key.toLowerCase())
          .attr('stroke', this.getColor(key))
          .attr('stroke-width', 3)
          .attr('fill', Colors.lightGray)
          .attr('r', 3)
          .attr('transform', 'translate(' + shift + ', 30)');
        shift += 10;
        select('.outer-g')
          .append('text')
          .text(
            t(`COMMON.CATEGORIES.${key}`) +
              (isSum && key === 'BALANCE' ? ' (\u03A3)' : ''),
          )
          .attr('transform', 'translate(' + shift + ', 34)')
          .attr('class', 'legend-text')
          .style('fill', this.getColor(key));
        shift +=
          getTextWidth(
            t(`COMMON.CATEGORIES.${key}`),
            'normal 12px VarelaRound',
          ) + (isSum && key === 'BALANCE' ? 60 : 40);
      }
    }

    // position legend group to center
    select('.outer-g').attr(
      'transform',
      'translate(' +
        (this.margin.left + (this.width - this.margin.right - shift) / 2) +
        ', 0)',
    );

    // the main chart group
    const g = svg
      .append('g')
      .attr('class', 'chart-g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')',
      );

    // draw axis X with labels
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('fill', Colors.costBlue)
      .style('stroke', 'none')
      .attr('class', 'label-text')
      .attr('dx', isHorizontalLabels ? 0 : '-.8em')
      .attr('dy', isHorizontalLabels ? '.9em' : '-.55em');

    // position x-labels in an intelligent way (rotate or shift)
    selectAll('.label-text')
      .nodes()
      .forEach((node) =>
        select(node).attr(
          'transform',
          isHorizontalLabels
            ? 'translate(' +
                (node as SVGTextContentElement).getComputedTextLength() / 2 +
                ', 0)'
            : 'rotate(-90)',
        ),
      );

    // draw axis Y
    g.append('g').attr('class', 'axis axis--y').call(axisLeft(yScale).ticks(5));

    // line drawer function
    const line = d3line()
      .x((_, i: number) => mapX(i))
      .y((d: any) => {
        return isSum && d.sumAmount ? mapY(d.sumAmount) : mapY(d.amount);
      })
      .curve(curveMonotoneX);

    // draw each line
    for (let key in chart) {
      if (
        chart.hasOwnProperty(key) &&
        chart[key as keyof typeof chart] &&
        key !== 'prevBalance'
      ) {
        g.append('path')
          .attr('class', 'line')
          // @ts-ignore
          .attr('d', () => {
            // @ts-ignore
            return line(chart[key as keyof typeof chart]);
          })
          .attr('stroke', this.getColor(key))
          .attr('stroke-width', 3)
          .attr('fill', 'none')
          .call(this.transition);
      }
    }

    // draw dots at each data point
    for (let key in chart) {
      if (chart.hasOwnProperty(key) && chart[key as keyof typeof chart]) {
        setTimeout(() => {
          const that = this;
          const selection = g
            .selectAll('.dot.' + key.toLowerCase())
            // @ts-ignore
            .data(this.props.chart[key])
            .enter()
            .append('circle');
          selection
            .on('mouseover', function (event: Event, d: MappedDataPoint) {
              const nodes = selection.nodes();
              // @ts-ignore
              const i = nodes.indexOf(this);
              that.onMouseOver(d, i, nodes);
            })
            .on('mouseout', function (event: Event, d: MappedDataPoint) {
              const nodes = selection.nodes();
              // @ts-ignore
              const i = nodes.indexOf(this);
              that.onMouseOut(d, i, nodes);
            })
            .attr('class', 'dot ' + key.toLowerCase())
            .attr('cx', (_: any, i: number) => mapX(i))
            .attr('cy', (d: MappedDataPoint) => {
              if (key === 'BALANCE') {
                return isSum ? mapY(d.sumAmount || 0) : mapY(d.amount);
              }
              return mapY(d.amount);
            })
            .attr('stroke', this.getColor(key))
            .attr('stroke-width', 3)
            .attr('fill', Colors.lightGray)
            .attr('r', 3)
            .style('opacity', 0)
            .transition()
            .duration(200)
            .ease(easeLinear)
            .style('opacity', 1);
        }, LineChartAnimationLength - 100);
      }
    }

    // the tooltip
    setTimeout(() => {
      select('.chart-g')
        .append('rect')
        .attr('width', this.tooltipWidth)
        .attr('height', this.tooltipHeight)
        .attr('class', 'cost-tooltip')
        .attr('rx', 20)
        .attr('ry', 20)
        .style('fill', Colors.lightGray)
        .style('opacity', 0.85)
        .style('stroke-width', 3)
        .style('display', 'none');
      // the tooltip text
      select('.chart-g')
        .append('text')
        .attr('class', 'tooltip-text')
        .style('display', 'none');
    }, LineChartAnimationLength + 500);
  };

  onMouseOver(d: MappedDataPoint, i: number, nodes: any) {
    const circle = select(nodes[i]);
    const tooltipText =
      circle.classed('balance') && this.props.isSum
        ? getMoneyString(d.sumAmount || 0)
        : getMoneyString(d.amount);
    circle.attr('r', 5);
    const translateX = Math.min(
      this.width - this.tooltipWidth + this.margin.right - 3,
      ((circle.attr('cx') as unknown) as number) - this.tooltipWidth / 2,
    );
    select('.cost-tooltip')
      .attr(
        'transform',
        'translate(' +
          translateX +
          ', ' +
          (((circle.attr('cy') as unknown) as number) -
            this.tooltipHeight -
            5) +
          ')',
      )
      .style('stroke', circle.attr('stroke'))
      .style('display', 'block');
    select('.tooltip-text')
      .text(tooltipText)
      .attr(
        'transform',
        'translate(' +
          (translateX +
            (this.tooltipWidth -
              getTextWidth(tooltipText, 'normal 16px VarelaRound')) /
              2) +
          ', ' +
          (((circle.attr('cy') as unknown) as number) -
            this.tooltipHeight / 2 +
            2) +
          ')',
      )
      .attr('fill', circle.attr('stroke'))
      .style('display', 'block');
  }

  onMouseOut = (d: MappedDataPoint, i: number, nodes: any) => {
    select(nodes[i]).attr('r', 3);
    select('.cost-tooltip').style('display', 'none');
    select('.tooltip-text').style('display', 'none');
  };

  transition = (path: any) => {
    path
      .transition()
      .duration(LineChartAnimationLength)
      .attrTween('stroke-dasharray', this.tweenDash);
  };

  tweenDash() {
    const l = (this as any).getTotalLength(),
      i = interpolateString('0,' + l, l + ',' + l);
    // @ts-ignore
    return (t) => i(t);
  }

  // @ts-ignore
  getColor = (key) =>
    key === 'BALANCE'
      ? Colors.costBlue
      : key === 'COST'
      ? Colors.costRed
      : key === 'INCOME'
      ? Colors.costGreen
      : LineColors[
          this.legends.indexOf(this.props.t(`COMMON.CATEGORIES.${key}`)) %
            LineColors.length
        ];

  render() {
    return (
      <div className="line-chart-container" ref={(r) => (this.node = r)} />
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    chart: state.chart,
  };
};

const connector = connect(mapStateToProps, {});

export default compose(connector)(withTranslation()(LineChart));
