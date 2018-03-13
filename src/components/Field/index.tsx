import React, { Component } from 'react';
import '../../styles/field.css';

export interface IFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  blurCounter?: number;
  value: string | number;
  multipleRows?: boolean;
  disabled?: boolean;
  inline?: boolean;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
  serverErrors?: any;
  onTouch?: () => void;
  onBlur?: () => void;
  onChangeEvent?: (v: any) => void;
}

interface IFieldState {
  name: string;
  value: string | number;
  serverErrors: any;
  changeCounter: number;
  blurCounter: number;
  focus: boolean;
  touched: boolean;
  valueOnMount: any;
}

class Field extends Component<IFieldProps, IFieldState> {
  constructor(props: IFieldProps) {
    super(props);

    this.state = {
      name: props.name,
      value: props.value || '',
      serverErrors: props.serverErrors,
      changeCounter: 0,
      blurCounter: 0,
      focus: false,
      touched: false,
      valueOnMount: props.value || ''
    };

    this.handleTouch = this.handleTouch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleMultipleRows() {
    if (this.props.multipleRows) {
      const textArea = document.getElementById('textarea_' + this.props.name)!;
      textArea.style.cssText = 'height:auto;';
      var height = (2 + textArea.scrollHeight) + 'px';
      textArea.style.cssText = 'height:' + height + ';';
    }
  }

  handleTouch() {
    if (this.props.onTouch) {
      this.props.onTouch();
    }
    this.setState({
      touched: true,
      focus: true
    });
  }

  handleBlur(): void {
    if (this.props.onBlur) {
      this.props.onBlur();
    }
    this.setState({
      focus: false,
      blurCounter: this.state.blurCounter + 1
    });
  }

  handleChange(e: any): void {
    var value = e.target.value;
    this.setState({
      value: value,
      serverErrors: undefined,
      changeCounter: this.state.changeCounter + 1
    });
    this.handleMultipleRows();
  }

  componentDidMount() {
    this.setState({
      valueOnMount: this.state.value
    });
    this.handleMultipleRows();
  }

  render() {
    var that = this;
    function getErrors() {

      if (that.state.serverErrors && that.state.value === that.state.valueOnMount) { return that.state.serverErrors; }
      if (!that.state.touched && that.state.value === '' && that.state.changeCounter === 0) { return; }
    }

    var err = getErrors();

    return (
      <div className={'field ' + (this.props.inline ? ' no-margin' : '')}>
        <div>
          {
            this.props.inline ? '' : (
              <span className={'field-label ' + (this.state.value || this.props.label ? '' : 'field-label-hidden')}>
                {(this.props.label || this.props.placeholder || this.props.name) + (this.props.required ? ' *' : '')}
              </span>
            )
          }
        </div>
        {
          !this.props.multipleRows ? (
            <input
              className={'input ' + (err ? 'input-error' : '') + (' input-' + this.props.size)}
              type={this.props.type || 'text'}
              name={this.props.name}
              value={this.state.value}
              onClick={this.handleTouch}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              placeholder={(this.props.placeholder || this.props.name)
                + (this.props.required && !this.props.label ? ' *' : '')}
              disabled={this.props.disabled}
              required={this.props.required}
              minLength={this.props.minLength}
              min={this.props.min}
              max={this.props.max}
              step={this.props.step}
            />
          ) : (
              <textarea
                id={'textarea_' + this.props.name}
                className={'input ' + (err ? 'input-error' : '') + (' input-' + this.props.size)}
                // type={this.props.type || 'text'} // textarea type is readonly..
                name={this.props.name}
                rows={1}
                value={this.state.value}
                onClick={this.handleTouch}
                onBlur={this.handleBlur}
                onChange={this.handleChange}
                placeholder={(this.props.placeholder || this.props.name)
                  + (this.props.required && !this.props.label ? ' *' : '')}
                disabled={this.props.disabled}
                required={this.props.required}
                minLength={this.props.minLength}
              />
            )
        }
        {
          this.props.inline ? '' : (
            <div>
              {
                err ? (
                  <div className="field-error">
                    <span>{err}</span>
                  </div>
                ) : (
                    <div className="field-description">
                      <span>{this.props.description}</span>
                    </div>
                  )
              }
            </div>
          )
        }
      </div>
    );
  }

  // componentWillReceiveProps(newprops) {
  //   this.setState({
  //     serverErrors: newprops.serverErrors
  //   });
  // }
}

// Field.propTypes = {
//   name: PropTypes.string.isRequired,
//   placeholder: PropTypes.string,
//   label: PropTypes.string,
//   size: PropTypes.string,
//   type: PropTypes.string,
//   onTouch: PropTypes.func,
//   onChangeEvent: PropTypes.func,
//   onBlurEvent: PropTypes.func,
//   disabled: PropTypes.bool,
//   required: PropTypes.bool,
//   minLength: PropTypes.number,
//   maxLength: PropTypes.number,
//   error: PropTypes.string
// };

export default Field;
