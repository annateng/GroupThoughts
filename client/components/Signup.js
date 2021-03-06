import React, { useState, useRef, useEffect } from 'react';
import {
  Form, Input, Button, Typography, Alert,
} from 'antd';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryParam, StringParam } from 'use-query-params';

import { signUpUser } from 'Utilities/services/userService';
import { loginUser } from 'Utilities/reducers/loginReducer';

const Signup = () => {
  const [alertMessage, setAlertMessage] = useState();
  const [alertType, setAlertType] = useState('error');
  const alertRef = useRef();
  const history = useHistory();
  const dispatch = useDispatch();
  const [email] = useQueryParam('email', StringParam);
  const [friendId] = useQueryParam('friendId', StringParam);
  const [friendName] = useQueryParam('friendName', StringParam);

  // Clean up alert settimeouts if component unmounts
  useEffect(() => () => clearTimeout(alertRef.current), []);

  const handleSetError = (errorMessage) => {
    if (!errorMessage) setAlertMessage('Error while logging in.');
    else if (errorMessage.toLowerCase().includes('username')) setAlertMessage('Username taken.');
    else if (errorMessage.toLowerCase().includes('email')) setAlertMessage('User already exists for this email address.');
    else setAlertMessage(errorMessage);

    setAlertType('error');

    if (alertRef.current) clearTimeout(alertRef.current);
    alertRef.current = setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleSignUp = async (values) => {
    try {
      const newUser = await signUpUser({
        ...values,
      });

      // automatically log in after sign up
      await dispatch(loginUser({
        username: newUser.username,
        password: values.password,
      }));

      setAlertMessage('Success!');
      setAlertType('success');

      if (alertRef.current) clearTimeout(alertRef.current);
      alertRef.current = setTimeout(() => {
        if (!friendId) history.push('/home?firstTime=true');
        else history.push(`/home?firstTime=true&friendId=${friendId}&friendName=${friendName}`);
      }, 1000);
    } catch (e) {
      console.error(e.message);
      handleSetError(e.message);
    }
  };

  const validateMessages = {
    required: '${label} required!', // eslint-disable-line no-template-curly-in-string
    types: {
      email: 'Please enter valid email address.',
    },
  };

  // Alert message settings
  const displayStyle = alertMessage ? null : { display: 'none' };

  return (
    <div className="main-layout vertical-center-div">
      <Alert message={alertMessage} type={alertType} showIcon style={displayStyle} className="skinny-skinny-alert" />
      <div className="skinny-skinny-container">
        <Typography.Title>Sign Up</Typography.Title>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleSignUp}
          validateMessages={validateMessages}
          onFinishFailed={() => console.error('Required form fields missing.')}
        >
          <Form.Item
            label="Name"
            name="displayName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="E-mail address"
            name="email"
            initialValue={email ? decodeURIComponent(email) : null}
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" size="large" style={{ marginRight: '20px' }}>Sign Up</Button>
            <Button htmlType="submit" size="large" style={{ fontSize: '16px' }} onClick={() => history.push('/login')}>I already have an account</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
