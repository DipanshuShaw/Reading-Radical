// import React from 'react'
// import Template from '../Template'
import Comics from './Horror'
import Action from './Action'
import Detective from './Detective'
import Scifi from './Scifi'
import Motivational from './Motivational'
import Romantic from './Romantic'
// import Template from '../template'
const All = () => {
    return (
        <>
            <section className="explore-all">
                <Comics/>
                <Romantic/>
                <Action/>
                <Detective/>
                <Scifi/>
                <Motivational/>
                {/* <Template/> */}

            </section>
        </>
    )
}

export default All
