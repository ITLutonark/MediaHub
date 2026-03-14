from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django import forms
from django.forms.widgets import CheckboxSelectMultiple, CheckboxInput

from .models import Article, Tag, Section


class ArticleUpdateForm(forms.ModelForm):
    """Описание формы для изменения статьи"""
    content = forms.CharField(widget=CKEditorUploadingWidget(), label='Содержание')
    status = forms.ChoiceField(required=False, widget=forms.RadioSelect,
                               choices=Article.STATUS_CHOICES,
                               label='Отправить на модерацию или сохранить как черновик')
    tags = forms.CharField(
        label='Тэги',
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите теги через запятую (например: Python, Django, Веб-разработка)'
        })
    )

    class Meta:
        model = Article
        exclude = ('author', 'is_active', 'is_published')

    # Всем полям формы добавляется значение 'form-control' http-атрибута 'class'
    def __init__(self, *args, **kwargs):
        super(ArticleUpdateForm, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name != 'status':
                field.widget.attrs['class'] = 'form-control'
        if self.instance.section.slug == 'help':
            self.fields["section"].queryset = Section.objects.filter(slug='help')
        else:
            self.fields["section"].queryset = Section.objects.exclude(slug='help')
        # Инициализируем поле tags с существующими тегами
        if self.instance and self.instance.pk:
            self.fields["tags"].initial = ', '.join([tag.name for tag in self.instance.tags.all()])

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save()
            self.save_tags(instance)
        return instance

    def save_tags(self, article):
        """Обработка тегов из текстового поля"""
        tags_input = self.cleaned_data.get('tags', '')
        if isinstance(tags_input, str):
            tag_names = [name.strip() for name in tags_input.split(',') if name.strip()]
            article.tags.clear()
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'slug': tag_name.lower().replace(' ', '_')}
                )
                article.tags.add(tag)


class ArticleCreateForm(forms.ModelForm):
    """Описание формы для создания статьи"""
    content = forms.CharField(widget=CKEditorUploadingWidget(), label='Содержание')
    status = forms.ChoiceField(widget=forms.RadioSelect,
                               choices=Article.STATUS_CHOICES,
                               label='Отправить на модерацию или сохранить как черновик')
    tags = forms.CharField(
        label='Тэги',
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите теги через запятую (например: Python, Django, Веб-разработка)'
        })
    )

    class Meta:
        model = Article
        exclude = ('author', 'is_active', 'is_published')

    # Всем полям формы добавляется значение 'form-control' http-атрибута 'class'
    def __init__(self, *args, **kwargs):
        super(ArticleCreateForm, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name != 'status':
                field.widget.attrs['class'] = 'form-control'
        self.fields["section"].queryset = Section.objects.exclude(slug='help')
        # Инициализируем поле tags с существующими тегами, если это редактирование
        if self.instance and self.instance.pk:
            self.fields["tags"].initial = ', '.join([tag.name for tag in self.instance.tags.all()])

    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save()
            self.save_tags(instance)
        return instance

    def save_tags(self, article):
        """Обработка тегов из текстового поля"""
        tags_input = self.cleaned_data.get('tags', '')
        if isinstance(tags_input, str):
            tag_names = [name.strip() for name in tags_input.split(',') if name.strip()]
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={'slug': tag_name.lower().replace(' ', '_')}
                )
                article.tags.add(tag)
