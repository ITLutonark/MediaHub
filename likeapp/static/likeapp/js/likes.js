function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$(document).on("click", ".like", addVote);
$(document).on("click", ".dislike", addVote);

function addVote() {
    let type = $(this).data("type");
    let pk = $(this).data("id");
    let action = $(this).hasClass("like") ? "like" : "dislike";
    let csrf_token = getCookie('csrftoken');
    
    $.ajax({
        url: "/likes/" + type + "/" + pk + "/" + action + "/",
        type: 'POST',
        data: {
            'obj': pk,
            'csrfmiddlewaretoken': csrf_token
        },
        success: function (json) {
            if (json.redirect) {
                window.location.href = json.redirect;
            } else {
                $(`li[data-type="${type}"][data-id="${pk}"] > span.like_count`).html(json.like_count);
                $(`li[data-type="${type}"][data-id="${pk}"] > span.dislike_count`).html(json.dislike_count);
                if (type === "article") {
                    $(`span.article_rating`).html(json.sum_rating);
                }
                if (type === "user") {
                    $(`span.user_rating`).html(json.sum_rating);
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при отправке голоса:', error);
        }
    });
    return false;
};