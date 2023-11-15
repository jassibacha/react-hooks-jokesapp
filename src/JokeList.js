import React, { useEffect } from 'react';
import axios from 'axios';
import Joke from './Joke';
import './JokeList.css';

/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {
    const [jokes, setJokes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    /* store jokes in localstorage */
    useEffect(() => {
        /* only save if there are jokes */
        if (jokes.length > 0) {
            window.localStorage.setItem('jokes', JSON.stringify(jokes));
        }
    }, [jokes]); /* run when jokes changes */

    /* at mount/load, get jokes from localstorage or API */
    useEffect(() => {
        const savedJokes = window.localStorage.getItem('jokes');
        // console.log(
        //     'savedJokes = ',
        //     savedJokes,
        //     'parsed = ',
        //     JSON.parse(savedJokes)
        // );
        if (savedJokes && JSON.parse(savedJokes).length > 0) {
            //console.log('savedJokes = ', savedJokes);
            setJokes(JSON.parse(savedJokes));
            setIsLoading(false);
        } else {
            getJokes();
        }
    }, []); /* Empty array means this effect runs once after the initial render */

    /* retrieve jokes from API */
    async function getJokes() {
        //console.log('getJokes called');
        try {
            // load jokes one at a time, adding not-yet-seen jokes
            let jokes = [];
            let seenJokes = new Set();
            while (jokes.length < numJokesToGet) {
                //console.log('while loop, length = ', jokes.length);
                let res = await axios.get('https://icanhazdadjoke.com', {
                    headers: { Accept: 'application/json' },
                });
                let { ...joke } = res.data;

                if (!seenJokes.has(joke.id)) {
                    seenJokes.add(joke.id);
                    jokes.push({ ...joke, votes: 0 });
                } else {
                    console.log('duplicate found!');
                }
            }
            setJokes(jokes);
            setIsLoading(false);
        } catch (e) {
            console.log(e);
        }
    }

    /* empty joke list, set to loading state, and then call getJokes */
    function generateNewJokes() {
        setIsLoading(true);
        getJokes();
    }

    /* change vote for this id by delta (+1 or -1) */
    function vote(id, delta) {
        setJokes(
            jokes.map((j) =>
                j.id === id ? { ...j, votes: j.votes + delta } : j
            )
        );
    }

    let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
    //console.log('sortedJokes = ', sortedJokes);
    if (isLoading) {
        return (
            <div className="loading">
                <i className="fas fa-4x fa-spinner fa-spin" />
            </div>
        );
    }

    return (
        <div className="JokeList">
            <button className="JokeList-getmore" onClick={generateNewJokes}>
                Get New Jokes
            </button>

            {sortedJokes.map((j) => (
                <Joke
                    text={j.joke}
                    key={j.id}
                    id={j.id}
                    votes={j.votes}
                    vote={vote}
                />
            ))}
        </div>
    );
}

export default JokeList;
