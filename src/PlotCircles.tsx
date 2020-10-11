import React from 'react';
import { Tooltip, GraphLegend, LegendDisplayMode, HorizontalGroup } from '@grafana/ui';
import { formattedValueToString, getValueFormat } from '@grafana/data';
import { Axis, TimeXYDatumProps } from './types';

interface LegendProps {
  color: string;
  label: string;
  isVisible: boolean;
  yAxis: number;
}

interface PlotCirclesProps {
  data: TimeXYDatumProps[];
  radius: number;
  xAxis: Axis;
  yAxis: Axis;
  xScale: (a: number) => number;
  yScale: (a: number) => number;
  legend: LegendProps;
}

export class PlotCircles extends React.PureComponent<PlotCirclesProps> {
  render() {
    const { data, radius, xAxis, yAxis, xScale, yScale, legend } = this.props;
    return (
      <g>
        {data.map(datum => {
          if (datum.timestamp && datum.x && datum.y) {
            const x = formattedValueToString(getValueFormat(xAxis.unit)(datum.x, xAxis.decimals));
            const y = formattedValueToString(getValueFormat(yAxis.unit)(datum.y, yAxis.decimals));
            return (
              <Tooltip
                content={() => {
                  return (
                    <HorizontalGroup>
                      <GraphLegend items={[legend]} placement="over" displayMode={LegendDisplayMode.List}></GraphLegend>
                      <div>
                        {xAxis.label} {x}, {yAxis.label} {y}
                      </div>
                    </HorizontalGroup>
                  );
                }}
                theme="info"
              >
                <circle r={String(radius)} cx={xScale(datum.x)} cy={yScale(datum.y)} fill={legend.color}></circle>
              </Tooltip>
            );
          } else {
            return;
          }
        })}
      </g>
    );
  }
}
