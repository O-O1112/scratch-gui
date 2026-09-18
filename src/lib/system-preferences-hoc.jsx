import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {setTheme} from '../reducers/theme';
import {detectTheme} from './themes/themePersistance';

const prefersDarkQuery = '(prefers-color-scheme: dark)';
const prefersHighContrastQuery = '(prefers-contrast: more)';

const systemPreferencesHOC = function (WrappedComponent) {
    class SystemPreferences extends React.Component {
        componentDidMount () {
            this.preferencesListener = () => this.props.onSetTheme(detectTheme());

            if (window.matchMedia) {
                this.highContrastMatchMedia = window.matchMedia(prefersHighContrastQuery);
                if (this.highContrastMatchMedia) {
                    if (this.highContrastMatchMedia.addEventListener) {
                        this.highContrastMatchMedia.addEventListener('change', this.preferencesListener);
                    } else {
                        this.highContrastMatchMedia.addListener(this.preferencesListener);
                    }
                }
                this.darkMatchMedia = window.matchMedia(prefersDarkQuery);
                if (this.darkMatchMedia) {
                    if (this.darkMatchMedia.addEventListener) {
                        this.darkMatchMedia.addEventListener('change', this.preferencesListener);
                    } else {
                        this.darkMatchMedia.addListener(this.preferencesListener);
                    }
                }
            }
        }

        componentWillUnmount () {
            if (this.highContrastMatchMedia) {
                if (this.highContrastMatchMedia.removeEventListener) {
                    this.highContrastMatchMedia.removeEventListener('change', this.preferencesListener);
                } else {
                    this.highContrastMatchMedia.removeListener(this.preferencesListener);
                }
            }
            if (this.darkMatchMedia) {
                if (this.darkMatchMedia.removeEventListener) {
                    this.darkMatchMedia.removeEventListener('change', this.preferencesListener);
                } else {
                    this.darkMatchMedia.removeListener(this.preferencesListener);
                }
            }
        }

        render () {
            const {
                /* eslint-disable no-unused-vars */
                onSetTheme,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            return <WrappedComponent {...props} />;
        }
    }

    SystemPreferences.propTypes = {
        onSetTheme: PropTypes.func
    };

    const mapDispatchToProps = dispatch => ({
        onSetTheme: theme => dispatch(setTheme(theme))
    });

    return connect(
        null,
        mapDispatchToProps
    )(SystemPreferences);
};

export default systemPreferencesHOC;
