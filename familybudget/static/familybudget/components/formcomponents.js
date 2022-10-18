/**Input control*/
function Input({
  onValueChange,
  styles,
  name,
  type,
  placeholder,
  min,
  max,
  value,
  autofocus
}) {
  /**Handles input's on change event */
  function handleChange(event) {
    onValueChange(event.target);
  }
  if(autofocus)
  {
    return (
      <input autoFocus
        className={styles}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        autocomplete="off"
      />
    );
  } 
  else{
    return (
      <input
        className={styles}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        autocomplete="off"
  
      />
    );
  }
}
Input.propTypes = {
  /**Gets called when onChange event is triggered */
  onValueChange: PropTypes.func,
  /**Input's Css */
  styles: PropTypes.string,
  /**Input's name */
  name: PropTypes.string,
  /**Input's type */
  type: PropTypes.string,
  /**Input's placeholder */
  placeholder: PropTypes.string,
  /**Input's min if needed */
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**Input's max if needed */
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**Specifies the value for the element (state lifted up) */
  value: PropTypes.string,
  /**Specifies autofocus */
  autofocus: PropTypes.bool
};

/**Checkbox control */
function CheckBox({ onChange, name, checked, label }) {
  /**Handles onChange event */
  function handleChange(event) {
    onChange(event.target.name);
  }

  return (
    <div class="form-check">
      <input
        name={name}
        onChange={handleChange}
        class="form-check-input"
        checked={checked}
        type="checkbox"
        value=""
        id="flexCheckDefault"
      />
      <label class="form-check-label text-white" for="flexCheckDefault">
        {label}
      </label>
    </div>
  );
}
CheckBox.propTypes = {
  /**Gets called when onChange event is triggered */
  onChange: PropTypes.func,
  /**Input's name */
  name: PropTypes.string,
  /**Bool whether input is checked or not */
  checked: PropTypes.bool,
  /**Checkbox's label */
  label: PropTypes.string,
};

/**Form's input label */
function Label({text, styles}) {
  return (
    <label className={"form-label fst-italic " + styles}>
      {text}
    </label>
  );
}
Label.propTypes = {
  /**Inner text */
  text: PropTypes.string,
  /**Css */
  styles: PropTypes.string
}

/**Form's select */
function Select({onValueChange, name, styles, data, value}) {
  /**Handles onChange event */
  function handleChange(event) {    
    onValueChange(event.target);
  }

  return (
    <select
      name={name}
      className={styles}
      value={value}
      onChange={handleChange}
    >
      {data.map((item) => (
        <option value={item.id}>{item.text}</option>
      ))}
    </select>
  );
}
Select.propTypes = {
  /**Gets called when onChange event is triggered */
  onValueChange : PropTypes.func,
  /**Element's name */
  name: PropTypes.string,
  /**Elemen'ts css */
  styles: PropTypes.string,
  /**Array of objects {id, text} to populate options */
  data: PropTypes.arrayOf(PropTypes.object),
  /**Specifies the value for the element (state lifted up) */
  value: PropTypes.string
}
/**Html date picker */
function DateSelect({onValueChange, min, value, styles, name }) {
  /**Handles onChange event */
  function handleChange(event) {
    onValueChange(event.target);
  }

  /**Set min attribut only when provided */
  if (min !== undefined) {
    return (
      <input
        min={min}
        className={styles}
        name={name}
        type="date"
        value={value}
        onChange={handleChange}
      />
    );
  } else {
    return (
      <input
        className={styles}
        name={name}
        type="date"
        value={value}
        onChange={handleChange}
      />
    );
  }
}
DateSelect.propTypes = {
  /**Gets called when onChange event is triggered */
  onValueChange: PropTypes.func,
  /**Specifies a minimum value for the element */
  min: PropTypes.string,
   /**Specifies the value for the element (state lifted up)*/
  value: PropTypes.string,
  /**Specifies the css for the element */
  styles: PropTypes.string,
  /**Specifies the name for the element */
  name: PropTypes.string
}
