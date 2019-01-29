import { Button, Form, Icon, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { push } from 'connected-react-router';
import React from 'react';
import { connect } from 'react-redux';
import { actions, ApplicationState } from '../../redux/store';

const mapStateToProps = (state: ApplicationState) => {
  return {
  };
};

const mapDispatchToProps = {
};

type LoginContainerProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

class LoginContainer extends React.PureComponent<
  LoginContainerProps & FormComponentProps
> {

  public render() {

    return (
      <div>
        dfdfd
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create<{}>()(LoginContainer));
