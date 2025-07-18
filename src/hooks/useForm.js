import { useState, useCallback, useRef, useEffect } from 'react';

const useForm = (initialValues = {}, validationRules = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    if (mountedRef.current) {
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [initialValues]);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Required field
    if (rules.required && !value) {
      return rules.required === true ? 'This field is required' : rules.required;
    }

    // Minimum length
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    // Maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    // Pattern matching
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }

    // Custom validation
    if (rules.validate) {
      return rules.validate(value, values);
    }

    // Match other field
    if (rules.matches) {
      return value === values[rules.matches] ? '' : rules.matchMessage || 'Fields do not match';
    }

    return '';
  }, [validationRules, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [values, validateField]);

  // Set a single field value
  const setFieldValue = useCallback((name, value, shouldValidate = true) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (shouldValidate) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    setSubmitCount(prev => prev + 1);
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(values).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {});
      setTouched(allTouched);
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        if (mountedRef.current) {
          resetForm();
        }
      } catch (error) {
        if (mountedRef.current) {
          setErrors(prev => ({
            ...prev,
            submit: error.message
          }));
        }
      } finally {
        if (mountedRef.current) {
          setIsSubmitting(false);
        }
      }
    }
  }, [values, validateForm, onSubmit, resetForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    setErrors,
    validateField,
    validateForm
  };
};

export default useForm; 