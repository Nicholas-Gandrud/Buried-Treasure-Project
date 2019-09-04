import React from "react";
import "./Player.css";

const Player = props => {
    const progressBarStyles = {
        width: (props.progress_ms*100 / props.duration_ms) + '%'
    };

    return(
        
        <div className = 'App'>
        {/* <script src = "https://sdk.scdn.co/spotify-player.js"></script>
        <script>
            window.onSpotifyWebPlaybackSDKReady = () => {
                
            }
        </script> */}
         

        
            
            <div className = 'main-wrapper'>
                <div className = 'now-playing_img'>
                    <img src ={props.currentlyPlaying.albumArt} style={{ height: 250 }}/>
                    
                </div>
            <div className ="now-playing_side">
            <div className = "now-playing_artist">{props.currentlyPlaying.artist}</div>
            <div className = "now-playing_name">{props.currentlyPlaying.name}</div>
            <div className = "now-playing_stats">{props.currentlyPlayingInfo.tempo + " " + props.currentlyPlayingInfo.tempoconfidence * 100 + '%'}</div>  
                <div className = "progress">
                <div
              className="progress_bar"
              style={progressBarStyles}/>
                </div>
            </div>
           
            </div>
        </div>
    );

    }
export default Player;
