import React from 'react';
import { css, cx } from 'emotion';
import * as d3 from 'd3';
import { VizLegend, LegendDisplayMode, VizLegendItem } from '@grafana/ui';
import { getValueFormat, PanelProps } from '@grafana/data';
import { CanvasOptions, CurvePoints, MergedFieldsProps, TimeXYDatumProps } from './types';
import { Curves } from './Curves';
import { PlotCircles } from './PlotCircles';
import { createMergedFields, mergeXYField } from './dataHandler';
import { ScatterOptions } from 'types/ScatterOptions';
import { ColData } from 'types/ColData';
import { FieldSet } from 'types/FieldSet';
import './ScatterPanel.css';

interface Props extends PanelProps<CanvasOptions> {}

function drawDots(options: ScatterOptions,
  fieldSets: FieldSet[],
  xValues: number[],
  yValues: number[][],
  colValues: number[][],
  xScale: Function,
  yScale: Function) {
  return fieldSets.map((y, i: number) => (
    xValues.map((x, j) => {
      const dotSize = y.sizeCol >= 0 ? colValues[y.sizeCol][j] : -y.sizeCol;

      const yValue = yValues[i][j];

      if (dotSize > 0 && yValue != null) {
        let className = `ScatterSet-${i}`;
        // if (options.legend.size && y.hidden) {
        //   className += ' ScatterSetHidden';
        // }

        return (
          <circle
            key={`circle-[${y}][${i}]`}
            cx={xScale(x)}
            cy={yScale(yValue)}
            r={dotSize}
            className={className}
            fill={y.color}
          />
        );
      }
      return <div key={`circle-[${y}][${i}]`} />;
    })
  ));
}

export const PerformanceCurvePanel: React.FC<Props> = ({ options, data, width, height, timeZone }) => {
  const styles = getStyles();
  const padding = { top: 20, right: 20, bottom: 70, left: 60 };

  type ChartDatum = { x: number; y: number };
  type CurveData = { color: string; data: ChartDatum[] };
  type DynamicCurveData = { color: string; data: ChartDatum[][] };

  // Read static performance curve data
  const performanceCurveData: CurvePoints[] = options.performanceCurveData;
  let dataCurves: CurveData[] = [];
  for (const [index, performanceCurveDatum] of performanceCurveData.entries()) {
    let curveXArray: string[] = performanceCurveDatum.performCurveX.split(',');
    let curveYArray: string[] = performanceCurveDatum.performCurveY.split(',');
    dataCurves[index] = { color: performanceCurveDatum.color, data: [] };
    for (let i = 0; i < Math.min(curveXArray.length, curveYArray.length); i++) {
      dataCurves[index].data[i] = { x: Number(curveXArray[i]), y: Number(curveYArray[i]) };
    }
  }

  // Read point radius
  const pointRadius: number = options.pointRadius;
  // Create series name array
  let seriesName: string[] = [];
  for (let i = 0; i < data.series.length; i++) {
    let name = data.series[i].name;
    if (name) {
      seriesName[i] = name;
    } else {
      seriesName[i] = '';
    }
  }

  // Create time-value merged field array from data
  // mergedFields is used for plotting operation point and drawing dynamic performance curve
  let mergedFields: MergedFieldsProps[] = createMergedFields(data);

  // Prepare data array for plotting operation point
  const plotSetting = options.plotSetting;
  let dataPlot: TimeXYDatumProps[][] = [];
  let dataLegend: VizLegendItem[] = [];
  for (let i = 0; i < plotSetting.length; i++) {
    let fieldPlotX = mergedFields.find((field) => field.name === plotSetting[i].xField);
    let fieldPlotY = mergedFields.find((field) => field.name === plotSetting[i].yField);
    if (fieldPlotX && fieldPlotY) {
      // Create time-x-y merged array
      let timeXYData: TimeXYDatumProps[] = mergeXYField(fieldPlotX, fieldPlotY);
      dataPlot[i] = timeXYData;
      // data for legend
      dataLegend[i] = {
        color: plotSetting[i].color,
        label: plotSetting[i].label,
        disabled: false,
        yAxis: 1,
      };
    }
  }

  // Prepare dynamic performance curve data
  const dynamicPerfCurve = options.dynamicPerfCurve;
  let dataDynamicCurves: DynamicCurveData[] = [];
  for (let i = 0; i < dynamicPerfCurve.length; i++) {
    let fieldGroup = dynamicPerfCurve[i].fieldGroup;
    dataDynamicCurves[i] = {
      color: options.dynamicPerfCurve[i].color,
      data: [],
    };
    // j: point(x, y)
    for (let j = 0; j < fieldGroup.length; j++) {
      let fieldCurveX = mergedFields.find((field) => field.name === fieldGroup[j].xField);
      let fieldCurveY = mergedFields.find((field) => field.name === fieldGroup[j].yField);
      if (fieldCurveX && fieldCurveY) {
        // Create time-x-y merged array
        let timeXYData: TimeXYDatumProps[] = mergeXYField(fieldCurveX, fieldCurveY);
        // data for curve
        // i:curve, k: time, j: point(x, y)
        for (let k = 0; k < timeXYData.length; k++) {
          if (dataDynamicCurves[i].data[k] === undefined) {
            dataDynamicCurves[i].data[k] = [];
          }
          let xPoint = timeXYData[k].x;
          let yPoint = timeXYData[k].y;
          if (xPoint && yPoint) {
            dataDynamicCurves[i].data[k][j] = { x: xPoint, y: yPoint };
          }
        }
      }
    }
  }

  // Read X-axis and Y-Axis settings
  const xMin = options.xAxis.minValue;
  const xMax = options.xAxis.maxValue;
  const yMin = options.yAxis.minValue;
  const yMax = options.yAxis.maxValue;

  // Function to add unit to axis label
  const getLabelWithUnit = (label: string, unit: string | undefined) => {
    const unitToIndicate = getValueFormat(unit)(0).suffix;
    if (unitToIndicate) {
      return label + ` [${unitToIndicate?.trim()}]`;
    } else {
      return label;
    }
  };

  // Scale
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax || 0.0])
    .range([padding.left, width - padding.right]);
  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax || 0.0])
    .range([height - padding.bottom, padding.top]);
  // Create axis
  const xAxis = d3.axisBottom(xScale).ticks(width / 80);
  const yAxis = d3.axisLeft(yScale).ticks(height / 80);

  // add drawDots 
  // if (data.series?.length > 0) {
  // }
    const frame = data.series[0];

    const colData = new Array(0);
    frame.fields.forEach((field) => {
      colData.push(new ColData(
        field.name,
        field.config?.displayName || field.name,
        field.type,
        field.values.toArray().map((v) => v as number),
      ));
    });
  
  const fieldSets = options.fieldSets.filter((x) => x != null && x?.col >= 0 && x?.col < colData.length);
  if (fieldSets.length === 0) {
    return (
      <div style={{ overflow: 'hidden', height: '100%' }}>
        <p>No Y Axis(s) data found in current query</p>
      </div>
    );
  }

  const colValues = colData.map((c) => c.values);
  const xValues = colData[options.SxAxis.col].type !== 'string' ? colValues[options.SxAxis.col] : Array.from(colValues[0], (x, i) => i + 1);
  const yValues = fieldSets.map((f) => colValues[f.col]);


  // Draw performance curve
  const curveGenerator = d3
    .line<ChartDatum>()
    .curve(d3.curveBasis)
    .x((d: ChartDatum) => {
      // To avoid type annotation error, if undefined then 0.0
      let x = xScale(d.x);
      if (typeof x === 'undefined') {
        x = 0.0;
      }
      return x;
    })
    .y((d: ChartDatum) => {
      // To avoid type annotation error, if undefined then 0.0
      let y = yScale(d.y);
      if (typeof y === 'undefined') {
        y = 0.0;
      }
      return y;
    });
  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* xAxis */}
        <g
          transform={`translate(0, ${height - padding.bottom})`}
          ref={(node) => {
            d3.select(node).call(xAxis as any);
          }}
        >
          <text
            x={(width - padding.left - padding.right) / 2 + padding.left}
            y="40"
            textAnchor="middle"
            fill="currentColor"
            fontSize="8pt"
          >
            {getLabelWithUnit(options.xAxis.label, options.xAxis.unit)}
          </text>
        </g>
        {/* yAxis */}
        <g
          transform={`translate(${padding.left}, 0)`}
          ref={(node) => {
            d3.select(node).call(yAxis as any);
          }}
        >
          <text
            x={-(height - padding.top - padding.bottom) / 2}
            y="-50"
            textAnchor="middle"
            fill="currentColor"
            transform="rotate(-90)"
            fontSize="8pt"
          >
            {getLabelWithUnit(options.yAxis.label, options.yAxis.unit)}
          </text>
        </g>
        {/* Grid Vertical Lines */}
        <g>
          {xScale.ticks().map((d: number) => {
            let x = xScale(d);
            x = typeof x === 'undefined' ? undefined : 0.5 + x;
            return (
              <line
                stroke="currentColor"
                strokeOpacity="0.1"
                y1={padding.top}
                y2={height - padding.bottom}
                x1={x}
                x2={x}
                key={'x_' + x?.toString()}
              ></line>
            );
          })}
        </g>
        {/* Grid Horizontal Lines */}
        <g>
          {yScale.ticks().map((d: number) => {
            let y = yScale(d);
            y = typeof y === 'undefined' ? undefined : 0.5 + y;
            return (
              <line
                stroke="currentColor"
                strokeOpacity="0.1"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                key={'y_' + y?.toString()}
              ></line>
            );
          })}
        </g>
        {/* Static Curve */}
        {dataCurves.map((dataCurve, index) => {
          return (
            <g id="static-curve-group" key={'dataCurve' + index.toString()}>
              <path
                fill="none"
                stroke={dataCurve.color}
                strokeWidth="1.5"
                id={'curve-' + index}
                ref={(node) => {
                  d3.select(node).datum(dataCurve.data).attr('d', curveGenerator);
                }}
              />
            </g>
          );
        })}
        {dataDynamicCurves.map((dataCurve, index) => {
          return (
            <g id="dynamic-curve-group" key={'dynamicCurve' + index.toString()}>
              <Curves
                fill="none"
                stroke={dataCurve.color}
                stroke-width="1.5"
                index={index}
                data={dataCurve.data}
                curveGenerator={curveGenerator}
              ></Curves>
            </g>
          );
        })}
        {/* Plot */}
        <g id="dots">
          {drawDots(options, fieldSets, xValues, yValues, colValues, xScale, yScale)}
        </g>
        <g id="plot-group">
          {dataPlot.map((data, i) => {
            return (
              <PlotCircles
                data={data}
                radius={pointRadius}
                xAxis={options.xAxis}
                yAxis={options.yAxis}
                xScale={xScale}
                yScale={yScale}
                legend={dataLegend[i]}
                timeZone={timeZone}
                key={'plot' + i.toString()}
              ></PlotCircles>
            );
          })}
        </g>
      </svg>
      <div className={styles.legend}>
        <VizLegend items={dataLegend} displayMode={LegendDisplayMode.List} placement="bottom" />
      </div>
    </div>
  );
};

const getStyles = () => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    legend: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
}
