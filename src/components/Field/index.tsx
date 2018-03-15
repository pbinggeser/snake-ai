import React from 'react';
import '../../styles/field.css';

export interface IFieldProps {
  name: string;
  label?: string;
  placeholder: string;
  type: string;
  description: string;
  value: string | number;
  disabled?: boolean;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
  onChangeEvent?: (v: any) => any;
}

const Field: React.SFC<IFieldProps> = (props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    var value = e.target.value;
    if (props.onChangeEvent) {
      props.onChangeEvent(value);
    }
  };

  return (
    <div className="field">
      <div>
        <span className={'field-label ' + (props.value || props.label ? '' : 'field-label-hidden')}>
          {(props.label || props.placeholder || props.name) + (props.required ? ' *' : '')}
        </span>
      </div>
      <input
            className={'input ' + (' input-' + props.size)}
            type={props.type || 'text'}
            name={props.name}
            value={props.value}
            onChange={handleChange}
            placeholder={(props.placeholder || props.name)
              + (props.required && !props.label ? ' *' : '')}
            disabled={props.disabled}
            required={props.required}
            minLength={props.minLength}
            min={props.min}
            max={props.max} // is this working?
            step={props.step}
      />
        <div>
          <div className="field-description">
            <span>{props.description}</span>
          </div>
        </div>
    </div>
  );
};

Field.defaultProps = { value: '50'};
export default Field;
