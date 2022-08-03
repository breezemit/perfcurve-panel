import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Checkbox, Select } from '@grafana/ui';
import { SXAxis } from '../types/SXAxis';

interface Props extends StandardEditorProps<SXAxis> { }

export const XAxisEditor: React.FC<Props> = ({ onChange, context }) => {
  if (
    context.data
    && context.data.length > 0) {
    const { SxAxis } = context.options;
    const options = context.data
      .flatMap((frame) => frame.fields)
      .map((field, index) => ({
        label: field.config?.displayName ? field.config.displayName : field.name,
        value: index,
        valid: field.type !== 'string',
      }));

    return (
      <div className="XAxisEditor">
        <div className="ScatterFlex">
          <div className="ScatterSelect">
            <Select<number>
              isLoading={false}
              value={SxAxis.col}
              onChange={(e) => {
                SxAxis.col = e.value as number;
                onChange(SxAxis);
              }}
              options={options}
            />
          </div>
          <div className="ScatterFlex">
            <div className="ScatterCheckbox" title="Draw X axis right to left">Inverted</div>
            <Checkbox
              value={SxAxis.inverted}
              onChange={(e) => {
                SxAxis.inverted = e.currentTarget.checked;
                onChange(SxAxis);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <Select onChange={() => { }} disabled />;
};

