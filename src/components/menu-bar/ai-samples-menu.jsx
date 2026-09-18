import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState, useRef} from 'react';
import {connect} from 'react-redux';

import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import {setProjectTitle} from '../../reducers/project-title';
import menuBarStyles from './menu-bar.css';
import dropdownCaret from './dropdown-caret.svg';

const SAMPLES = [
    {
        title: '🖐️ 手部辨識 (Handpose)',
        file: 'handpose.sb3',
        name: '手部辨識範例'
    },
    {
        title: '👤 臉部特徵網格 (Facemesh)',
        file: 'facemesh.sb3',
        name: '臉部特徵網格範例'
    },
    {
        title: '🎯 臉部部位高亮 (Face Highlight)',
        file: 'highlight.sb3',
        name: '臉部特徵點高亮範例'
    },
    {
        title: '🏓 ML 視訊桌球遊戲 (ML Pong)',
        file: 'ml_pong.sb3',
        name: 'ML視訊桌球遊戲'
    },
    {
        title: '✌️ ML 手勢分類 (Gesture Classifier)',
        file: '1or2.sb3',
        name: 'ML手勢動作分類範例'
    }
];

const AiSamplesMenu = ({isRtl, vm, onSetTitle}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const handleSelectSample = async sample => {
        setOpen(false);
        try {
            const response = await fetch(`./static/samples/${sample.file}`);
            if (!response.ok) {
                alert(`無法讀取範例專案: ${sample.title}`);
                return;
            }
            const buffer = await response.arrayBuffer();
            if (vm) {
                await vm.loadProject(buffer);
                if (onSetTitle) {
                    onSetTitle(sample.name);
                }
            }
        } catch (err) {
            console.error('Failed to load sample project:', err);
            alert('載入範例專案失敗');
        }
    };

    return (
        <div
            className={classNames(menuBarStyles.menuBarItem, menuBarStyles.hoverable, {
                [menuBarStyles.active]: open
            })}
            ref={containerRef}
            style={{userSelect: 'none', cursor: 'pointer'}}
            onMouseUp={() => setOpen(!open)}
        >
            <span style={{marginRight: '0.25rem', fontSize: '1.1rem'}}>🤖</span>
            <span className={menuBarStyles.collapsibleLabel} style={{fontWeight: 600}}>AI 範例</span>
            <img src={dropdownCaret} style={{marginLeft: '0.25rem'}} />
            <MenuBarMenu
                className={menuBarStyles.menuBarMenu}
                open={open}
                place={isRtl ? 'left' : 'right'}
                onRequestClose={() => setOpen(false)}
            >
                <MenuSection>
                    {SAMPLES.map(sample => (
                        <MenuItem
                            key={sample.file}
                            onClick={() => handleSelectSample(sample)}
                        >
                            <span style={{fontWeight: 500, padding: '0.35rem 0.5rem', display: 'block', fontSize: '0.85rem'}}>
                                {sample.title}
                            </span>
                        </MenuItem>
                    ))}
                </MenuSection>
            </MenuBarMenu>
        </div>
    );
};

AiSamplesMenu.propTypes = {
    isRtl: PropTypes.bool,
    onSetTitle: PropTypes.func,
    vm: PropTypes.shape({
        loadProject: PropTypes.func
    })
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onSetTitle: title => dispatch(setProjectTitle(title))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AiSamplesMenu);
