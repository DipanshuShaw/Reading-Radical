import Action from './Action'
import Scifi from './Scifi'
import Motivational from './Motivational'
import Romantic from './Romantic'
import Comedy from './Comedy'
import Fantasy from './Fantasy'
import Horror from './Horror'
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
