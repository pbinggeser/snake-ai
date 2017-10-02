import React, { Component } from 'react';
import PropTypes from 'prop-types'

import '../styles/field.css';

class Field extends Component {
  constructor(props){
    super(props);

    this.state = {
      name: props.name,
      value: props.value || '',
      serverErrors: props.serverErrors,
      changeCounter: 0,
      blurCounter: 0
    }
    // console.log('constructor', props.name);

    this.handleTouch = this.handleTouch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleTouch(){
    if(this.props.onTouch){
      this.props.onTouch();
    }
    this.setState({
      touched: true,
      focus: true
    });
    // console.log(this.state.name + ' was touched');
  }

  handleBlur(e){
    if(this.props.onBlur){
      this.props.onBlur();
    }
    this.setState({
      focus: false,
      blurCounter: this.state.blurCounter + 1
    });
    // console.log(this.state.name + ' was blurred');

    if(this.props.onBlurEvent){
      this.props.onBlurEvent(e.target.value);
      // console.log('SEND BLUR');
    }
  }

  handleChange(e){
    var value = e.target.value;

    if(this.props.multipleRows){
      document.getElementById('textarea_' + this.props.name).style.cssText = 'height:auto;';
      var height = (2 + document.getElementById('textarea_' + this.props.name).scrollHeight) + 'px';
      document.getElementById('textarea_' + this.props.name).style.cssText = 'height:' + height + ';';
    }

    this.setState({
      value: value,
      serverErrors: undefined,
      changeCounter: this.state.changeCounter + 1
    });

    if(this.props.onChangeEvent){
      this.props.onChangeEvent(value);
      // console.log('SEND CHANGE');
    }

    // console.log(this.state.name + ' was changed to', value);

  }

  componentDidMount(){
    
    this.setState({
      valueOnMount: this.state.value
    });


   if(this.props.multipleRows){
      document.getElementById('textarea_' + this.props.name).style.cssText = 'height:auto;';
      var height = (2 + document.getElementById('textarea_' + this.props.name).scrollHeight) + 'px';
      document.getElementById('textarea_' + this.props.name).style.cssText = 'height:' + height + ';';
      // console.log(height);
    }
  }

  render(){
    var that = this;
    var props = this.props;

    function getErrors(){
      
      if(that.state.serverErrors && that.state.value === that.state.valueOnMount) return that.state.serverErrors;
      // console.log(!that.state.touched && that.state.value === '' && that.state.changeCounter === 0);
      if(!that.state.touched && that.state.value === '' && that.state.changeCounter === 0) return;

      var v = that.state.value || "";
      
      if(props.maxLength !== undefined){
        // console.log(v.length, props.maxLength);
        if(v.length > props.maxLength){
          return "Too long: " + v.length + '/' + props.maxLength;
        }
      }

      if(that.state.blurCounter > 0){
        // check length
        if(props.minLength !== undefined){
          if(v.length < props.minLength){
            return "Must be at least " + props.minLength + " characters.";
          }
        }
        

        if(v === "" && props.required){
          return "Required.";
        }
      }
    }

    var err = getErrors();

    return  <div className={"field " + (this.props.inline ? " no-margin" : "")}>
      <div>
        {
          this.props.inline ? "" : (
            <span className={"field-label " + (this.state.value || this.props.label ? "" : "field-label-hidden") }>
              {(this.props.label || this.props.placeholder || this.props.name) + (this.props.required ? ' *' : '')}
            </span>
          )
        }
      </div>
      {
        !this.props.multipleRows ? (
            <input 
              className={"input " + (err ? "input-error" : "") + (" input-" + this.props.size)} 
              type={this.props.type || 'text'} 
              name={this.props.name}
              value={this.state.value}
              onClick={this.handleTouch}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              placeholder={(this.props.placeholder || this.props.name) + (this.props.required && !this.props.label ? ' *' : '')}
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
              className={"input " + (err ? "input-error" : "") + (" input-" + this.props.size)} 
              type={this.props.type || 'text'} 
              name={this.props.name}
              rows={1}
              value={this.state.value}
              onClick={this.handleTouch}
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              placeholder={(this.props.placeholder || this.props.name) + (this.props.required && !this.props.label ? ' *' : '')}
              disabled={this.props.disabled} 
              required={this.props.required}
              minLength={this.props.minLength}
            ></textarea>
          )
      }
      {
        this.props.inline ? "" : (
          <div>
            {
              err ? (
                <div className="field-error">
                  <span>{ err }</span>
                </div>
                ) : (
                <div className="field-description">
                  <span>{ this.props.description }</span>
                </div>
              )
            }
          </div>
        )
      }
    </div>
  }


  componentWillReceiveProps(newprops){
    this.setState({
      serverErrors: newprops.serverErrors
    })
  }
};


Field.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  size: PropTypes.string,
  type: PropTypes.string,
  onTouch: PropTypes.func,
  onChangeEvent: PropTypes.func,
  onBlurEvent: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  error: PropTypes.string
}

export default Field
