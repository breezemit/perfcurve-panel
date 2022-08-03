import { Field } from '@grafana/data';
import { FieldSet } from 'types/FieldSet';
import { XAxis } from './XAxis';
export interface CurvePoints {
  performCurveX: string;
  performCurveY: string;
  color: string;
}
export interface PlotSeries {
  label: string;
  xField: string;
  yField: string;
  color: string;
}

export interface CurveItem {
  xField: string;
  yField: string;
}

export interface CurveGroup {
  fieldGroup: CurveItem[];
  color: string;
}

export interface Axis {
  minValue: number;
  maxValue: number;
  label: string;
  unit: string | undefined;
  decimals: number | undefined;
}
export class XAxis {
  constructor(
    public col: number,
    public inverted: boolean,
  ) {
  }
}
export interface CanvasOptions {
  SxAxis: SXAxis,
  xAxis: Axis;
  yAxis: Axis;
  yAxisFields: number[],
  fieldSets: FieldSet[],
  performanceCurveData: CurvePoints[];
  dynamicPerfCurve: CurveGroup[];
  plotSetting: PlotSeries[];
  pointRadius: number;
}

export interface MergedFieldsProps {
  name: string;
  timeField: Field;
  valueField: Field;
}

export interface TimeXYDatumProps {
  timestamp: number | null;
  x: number | null;
  y: number | null;
}
