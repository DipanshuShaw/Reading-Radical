// import React from 'react'
// import Template from '../Template'
// import Comics from './Horror'
import Action from './Action'
// import Detective from './Detective'
import Scifi from './Scifi'
import Motivational from './Motivational'
import Romantic from './Romantic'
import Comedy from './Comedy'
import Fantasy from './Fantasy'
import Horror from './Horror'
// import Template from '../template'
const All = () => {
    return (
        <>
            <section className="explore-all">
                <Action/>
                <Motivational/>
                <Romantic/>
                <Scifi/>
                <Comedy/>
                <Fantasy/>
                <Horror/>


            </section>
        </>
    )
}

export default All
